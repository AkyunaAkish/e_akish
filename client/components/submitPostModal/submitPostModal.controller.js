class SubmitPostController {
    /**@ngInject*/
    constructor($uibModalInstance, $http, HOST, $localStorage, $rootScope, $state, socket, errorService) {
        this.$uibModalInstance = $uibModalInstance;
        this.$http = $http;
        this.HOST = HOST;
        this.$localStorage = $localStorage;
        this.$rootScope = $rootScope;
        this.$state = $state;
        this.errorService = errorService;
        this.socket = socket;
        this.password = '';
    }

    submitPost() {
        if (this.$localStorage.session &&
            typeof this.$localStorage.session === 'object' &&
            this.$localStorage.session.user &&
            typeof this.$localStorage.session.user === 'object' &&
            this.$localStorage.session.user.email &&
            typeof this.$localStorage.session.user.email === 'string' &&
            this.$localStorage.session.user.username &&
            typeof this.$localStorage.session.user.username === 'string' &&
            this.$localStorage.session.token &&
            typeof this.$localStorage.session.token === 'string' &&
            this.$localStorage.post.title &&
            typeof this.$localStorage.post.title === 'string' &&
            this.$localStorage.post.body &&
            typeof this.$localStorage.post.body === 'string' &&
            this.password &&
            typeof this.password === 'string') {
            this.submittingPost = true;
            this.$http.post(`${this.HOST}/posts/submit-post`, {
                    user: this.$localStorage.session.user,
                    token: this.$localStorage.session.token,
                    post: {
                        ...this.$localStorage.post,
                        content: this.$localStorage.post.body,
                        thumbnail_url: this.decideThumbnail()
                    },
                    password: this.password
                })
                .then((res) => {
                    if (res.data.success) {
                        this.socket.emit('post-submitted');
                        this.$state.go('layout.posts');
                        this.submittingPost = false;
                    } else {
                        this.submittingPost = false;
                        this.errorService.setAuthError(`${res.data.error || 'An error occurred submitting your post, please make sure you are signed in and have added content to your post and try again.'}`);
                        this.errorService.openErrorModal();
                    }
                })
                .catch((err) => {
                    this.submittingPost = false;
                    this.errorService.setAuthError(`${res.data.error || 'An error occurred submitting your post, please make sure you are signed in and have added content to your post and try again.'}`);
                    this.errorService.openErrorModal();
                });
        } else {
            this.submittingPost = false;
            this.errorService.setAuthError('Error submitting post, please sign in again and make sure that you have added content to your post.');
            this.errorService.openErrorModal();
        }
    }

    decideThumbnail() {
        if (this.$localStorage.post.thumbnailWeb) {
            return this.$localStorage.post.thumbnailWeb;
        } else if (this.$localStorage.post.thumbnailGoogleDrive) {
            return `https://docs.google.com/uc?id=${this.$localStorage.post.thumbnailGoogleDrive}`;
        } else {
            return '/images/ElenaAkishLotus.png';
        }
    }

    closeModal() {
        this.$uibModalInstance.dismiss();
    }
};

export default SubmitPostController;
