(function () {
    'use strict';

    angular
        .module('ng-drag-scroll', [])
        .directive('dragScroll', DragScroll);

    DragScroll.$inject = ['$document', '$window', '$parse'];

    /* @ngInject */
    function DragScroll($document, $window, $parse) {
        //Usage:
        //<div drag-scroll>Lorem ipsum dolor sit amet</div>
        var directive = {
            scope: {move: '&'},
            restrict: 'A',
            replace: true,
            link: function ($scope, $element, $attributes, vm) {
                var allowedClickOffset = 5;
                var pushed = false;
                var onDragStart = $parse($attributes.onDragStart);
                var onDragEnd = $parse($attributes.onDragEnd);
                var axis = $attributes.axis || false;
                var startClientX;
                var startClientY;
                var lastClientX;
                var lastClientY;
                var move = $scope.move || function () {
                        return true
                    };
                // Set event listeners
                $element.on('mousedown', handleMouseDown);

                // Set destroy listener
                $scope.$on('$destroy', destroy);

                /**
                 * Sets the event listeners for the mouseup and mousedown events
                 */
                function setDragListeners() {
                    angular.element($window).on('mouseup', handleMouseUp);
                    angular.element($window).on('mousemove', handleMouseMove);
                }

                /**
                 * Removes the event listeners for the mouseup and mousedown events
                 */
                function removeDragListeners() {
                    angular.element($window).off('mouseup', handleMouseUp);
                    angular.element($window).off('mousemove', handleMouseMove);
                }

                /**
                 * Handles mousedown event
                 * @param {object} e MouseDown event
                 */
                function handleMouseDown(e) {
        
                    $scope.$apply(function () {
                        onDragStart($scope);
                    });

                    // Set mouse drag listeners
                    setDragListeners();

                    // Set 'pushed' state
                    pushed = true;
                    lastClientX = startClientX = e.clientX;
                    lastClientY = startClientY = e.clientY;

                    clearSelection();
                    if (move()) {
                        e.preventDefault();
                        e.stopPropagation();
                    }
                }

                /**
                 * Handles mouseup event
                 * @param {object} e MouseUp event
                 */
                function handleMouseUp(e) {
                    var selectable = ('drag-scroll-text' in e.target.attributes);
                    var withinXConstraints = (e.clientX >= (startClientX - allowedClickOffset) && e.clientX <= (startClientX + allowedClickOffset));
                    var withinYConstraints = (e.clientY >= (startClientY - allowedClickOffset) && e.clientY <= (startClientY + allowedClickOffset));

                    // Set 'pushed' state
                    pushed = false;

                    // Check if cursor falls within X and Y axis constraints
                    if (selectable && withinXConstraints && withinYConstraints) {
                        // If so, select the text inside the target element
                        selectText(e.target);
                    }

                    $scope.$apply(function () {
                        onDragEnd($scope);
                    });

                    removeDragListeners();
                }

                /**
                 * Handles mousemove event
                 * @param {object} e MouseMove event
                 */
                function handleMouseMove(e) {
                    if (move() == true) {
                        if (pushed) {
                            if (!axis || axis === 'x') {
                                $element[0].scrollLeft -= (-lastClientX + (lastClientX = e.clientX));
                            }
                            if (!axis || axis === 'y') {
                                $element[0].scrollTop -= (-lastClientY + (lastClientY = e.clientY));
                            }
                        }

                        e.preventDefault();
                    }
                    else {
                        return false;
                    }
                }

                /**
                 * Destroys all the event listeners
                 */
                function destroy() {
                    $element.off('mousedown', handleMouseDown);
                    angular.element($window).off('mouseup', handleMouseUp);
                    angular.element($window).off('mousemove', handleMouseMove);
                }

                /**
                 * Selects text for a specific element
                 * @param {object} element Selected element
                 */
                function selectText(element) {
                    if ($window.document.selection) {
                        var range = $window.document.body.createTextRange();
                        range.moveToElementText(element);
                        range.select();
                    } else if ($window.getSelection) {
                        var range = $window.document.createRange();
                        range.selectNode(element);
                        $window.getSelection().addRange(range);
                    }
                }

                /**
                 * Clears text selection
                 */
                function clearSelection() {
                    if ($window.getSelection) {
                        if ($window.getSelection().empty) {  // Chrome
                            $window.getSelection().empty();
                        } else if ($window.getSelection().removeAllRanges) {  // Firefox
                            $window.getSelection().removeAllRanges();
                        }
                    } else if ($document.selection) {  // IE?
                        $document.selection.empty();
                    }
                }


            }
        };
        return directive;

    }

})();
