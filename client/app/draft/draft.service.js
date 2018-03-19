/* global angular */
angular.module('draft')
    .factory('DraftService', 
        ['UserService',
        function(UserService) {
            
            var socket = UserService.socket;
            
            return {
                test: 'test string',
                draftTypes: [],
                selectedDraftType: '',
                selectedCube: {},
                cubes: [],
                secretDraft: {},
                publicDrafts: {},
                draftId: ''
            };
        }
    ]);
