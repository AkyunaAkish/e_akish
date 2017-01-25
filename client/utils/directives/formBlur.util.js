export default ['$timeout', ($timeout) => {
    return {
        restrict: 'A',
        link: (scope, element) => {
            let defocusElement = angular.element('<input style="opacity: 0; width: 0" type="button">');
            element.append(defocusElement);

            element.on('keydown', (event) => {
                if (event.keyCode === 13) {
                    event.preventDefault();
                    $timeout(() => {
                        defocusElement.focus();
                        element.triggerHandler('submit');
                    }, 0, false);
                }
            });
        }
    };
}];
