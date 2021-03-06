import angular from 'angular';
import 'angular-ui-router';
import 'angular-bootstrap-npm';
import 'angular-messages';
import 'angular-moment';
import 'ngstorage';
import io from 'socket.io-client';

import layoutDirective from './components/layout/layout.directive.js';
import navbarDirective from './components/navbar/navbar.directive.js';
import postsDirective from './components/posts/posts.directive.js';
import postDirective from './components/post/post.directive.js';
import signupDirective from './components/signup/signup.directive.js';
import signinDirective from './components/signin/signin.directive.js';
import createPostDirective from './components/createPost/createPost.directive.js';
import settingsDirective from './components/settings/settings.directive.js';
import compileDirective from './utils/directives/compile.util.js';
import blurDirective from './utils/directives/blur.util.js';
import formBlurDirective from './utils/directives/formBlur.util.js';
import dirPagination from './utils/paginate/paginate.js';

import authService from './services/auth.service.js';
import signupService from './services/signup.service.js';
import signinService from './services/signin.service.js';
import errorService from './services/error.service.js';
import likeService from './services/like.service.js';

import Router from './routes.js';
import stateChange from './utils/stateChange.util.js';
import './sass/style.scss';

const HOST = process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : window.location.origin;
const socket = io.connect(HOST);

angular.module('ElenaAkish', [
        'ui.router',
        'ui.bootstrap',
        'ngMessages',
        'ngStorage',
        'angularMoment',
        dirPagination.name
    ])
    .constant('HOST', HOST)
    .constant('socket', socket)
    .config(['$qProvider', ($qProvider) => {
        $qProvider.errorOnUnhandledRejections(false);
    }])
    .service('errorService', errorService)
    .service('authService', authService)
    .service('signupService', signupService)
    .service('signinService', signinService)
    .service('likeService', likeService)
    .directive('compile', compileDirective)
    .directive('blur', blurDirective)
    .directive('formBlur', formBlurDirective)
    .directive('layoutDirective', layoutDirective)
    .directive('navbarDirective', navbarDirective)
    .directive('postsDirective', postsDirective)
    .directive('postDirective', postDirective)
    .directive('settingsDirective', settingsDirective)
    .directive('signupDirective', signupDirective)
    .directive('signinDirective', signinDirective)
    .directive('createPostDirective', createPostDirective)
    .config(Router)
    .run(stateChange);
