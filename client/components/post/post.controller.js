import editPostModalController from './modals/editPostModal/editPostModal.controller.js';
import deletePostModalController from './modals/deletePostModal/deletePostModal.controller.js';

class PostController {
    /**@ngInject*/
    constructor($uibModal, $http, HOST, socket, $scope, $rootScope, $state, errorService, authService, likeService, $sce, $localStorage) {
        this.$uibModal = $uibModal;
        this.$http = $http;
        this.$scope = $scope;
        this.$rootScope = $rootScope;
        this.$sce = $sce;
        this.$localStorage = $localStorage;
        this.errorService = errorService;
        this.likeService = likeService;
        this.authService = authService;
        this.HOST = HOST;
        this.socket = socket;
        this.$state = $state;
        this.commenting = false;
        this.session = this.authService.getSession();
        this.comments = [];
        this.hasSession = !!(this.$localStorage.session &&
                             this.$localStorage.session.token &&
                             this.$localStorage.session.user &&
                             this.$localStorage.session.user.email &&
                             this.$localStorage.session.user.username &&
                             this.$localStorage.session.user.user_created_at);

        this.isAdmin = !!(this.hasSession && this.$localStorage.session.user.username === 'Elena Akish');

        this.$http.get(`${this.HOST}/posts/retrieve-post/${this.$state.params.id}`).then((post) => {
            if (post.data.success) {
                this.post = post.data.success;
                this.retrieveComments();
                this.retrieveLikes();
            } else {
                this.$state.go('layout.posts');
            }
        }).catch((err) => {
            this.$state.go('layout.posts');
        });

        this.socket.on('update-comments', () => {
            this.retrieveComments();
            this.$scope.$evalAsync();
        });

        this.socket.on('update-likes', () => {
            this.retrieveLikes();
            this.$scope.$evalAsync();
        });
    }

    comment() {
        if (this.commentObj.comment && this.commentObj.comment.length > 0 && this.$localStorage.session && this.post) {
            this.commenting = true;
            this.$http.post(`${this.HOST}/posts/submit-comment`, {
                session: this.$localStorage.session,
                post: this.post,
                comment: this.commentObj.comment
            }).then((comment) => {
                if (comment.data.success) {
                    this.socket.emit('comment-submitted');
                    this.commentObj = {};
                    this.commenting = false;
                } else {
                    this.errorService.setAuthError(`An error occurred and the comment could not be added, please confirm that you are signed in and try again.`);
                    this.errorService.openErrorModal();
                    this.commenting = false;
                }
            }).catch((err) => {
                this.errorService.setAuthError(`An error occurred and the comment could not be added, please confirm that you are signed in and try again.`);
                this.errorService.openErrorModal();
                this.commenting = false;
            });
        }
    }

    retrieveComments() {
        this.$http.get(`${this.HOST}/posts/retrieve-comments/${this.$state.params.id}`).then((comments) => {
            if (comments.data.success) {
                this.comments = comments.data.success;
            } else {
                this.$state.go('layout.posts');
            }
        }).catch((err) => {
            this.$state.go('layout.posts');
        });
    }

    retrieveLikes() {
        this.$http.get(`${this.HOST}/posts/retrieve-likes/${this.$state.params.id}`).then((likes) => {
            if (likes.data.success) {
                this.likes = likes.data.success;
            } else {
                this.$state.go('layout.posts');
            }
        }).catch((err) => {
            this.$state.go('layout.posts');
        });
    }

    showDeleteButton(comment) {
        this.isCommentOwner = !!(this.hasSession && this.$localStorage.session.user.username === comment.username);
        if (!!(this.hasSession && this.isAdmin) || !!(this.hasSession && this.isCommentOwner)) {
            return true;
        } else {
            return false;
        }

    }

    deleteComment(comment) {
        this.isCommentOwner = !!(this.hasSession && this.$localStorage.session.user.username === comment.username);
        if (!!(this.hasSession && this.isAdmin)) {
            this.$http.post(`${this.HOST}/posts/delete-comment`, {
                session: this.$localStorage.session,
                comment: comment,
                admin: true
            }).then((commentRes) => {
                if (commentRes.data.success) {
                    this.socket.emit('comment-deleted');
                } else {
                    this.socket.emit('comment-deleted');
                    this.errorService.setAuthError(`An error occurred while deleting the comment, please confirm that you are signed in and try again.`);
                    this.errorService.openErrorModal();
                }
            }).catch((err) => {

                this.socket.emit('comment-deleted');
                this.errorService.setAuthError(`An error occurred while deleting the comment, please confirm that you are signed in and try again.`);
                this.errorService.openErrorModal();
            });
        } else if (!!(this.hasSession && this.isCommentOwner)) {
            this.$http.post(`${this.HOST}/posts/delete-comment`, {
                session: this.$localStorage.session,
                comment: comment,
                admin: false
            }).then((commentRes) => {
                if (commentRes.data.success) {
                    this.socket.emit('comment-deleted');
                } else {
                    this.socket.emit('comment-deleted');
                    this.errorService.setAuthError(`An error occurred while deleting the comment, please confirm that you are signed in and try again.`);
                    this.errorService.openErrorModal();
                }
            }).catch((err) => {
                this.socket.emit('comment-deleted');
                this.errorService.setAuthError(`An error occurred while deleting the comment, please confirm that you are signed in and try again.`);
                this.errorService.openErrorModal();
            });
        }
    }

    like() {
        this.likeService.like(this.post)
            .then((likeRes) => {
                this.socket.emit('like-event');
            })
            .catch((err) => {
                this.socket.emit('like-event');
            });
    }

    editPost(post) {
        this.$rootScope.postToEdit = post;
        this.$uibModal.open({
            scope: this.$scope,
            show: true,
            template: require('./modals/editPostModal/editPostModal.html'),
            controller: editPostModalController,
            controllerAs: 'vm',
            size: 'lg',
            keyboard: false,
            backdrop: 'static'
        });
    }

    deletePost(post) {
        this.$rootScope.postToDelete = post;
        this.$uibModal.open({
            scope: this.$scope,
            show: true,
            template: require('./modals/deletePostModal/deletePostModal.html'),
            controller: deletePostModalController,
            controllerAs: 'vm',
            size: 'lg',
            keyboard: false,
            backdrop: 'static'
        });
    }

    showModifyButtons() {
        if (this.$localStorage &&
            this.$localStorage.session &&
            this.$localStorage.session.user &&
            this.$localStorage.session.user.username &&
            this.$localStorage.session.user.username === 'Elena Akish') {
            return true;
        } else {
            return false;
        }
    }

    trustHTML(src) {
        return this.$sce.trustAsHtml(src);
    }
}

export default PostController;