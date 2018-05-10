// Double click move to deck/sideboard

            // $(document).on("click", ".maindeck .card-mana-link", function(e) {
            //     e.preventDefault();
            
            //     var self = this, time = 500;
            
            //     if ($(this).data('flag')) {
            //         //default href cancelled and new action taken instead
            //         clearTimeout($(this).data('timer'));
            //         var cardName = self.text;
            //         $scope.moveToSideboard(cardName);
            //     } else {
            //         //default href fired after timer
            //         $(this).data('timer', setTimeout(function() {
            //             window.location.href = $(self).attr('href');
            //         }, time));
            //     }
            
            //     $(this).data('flag', true);
            
            //     setTimeout(function() {
            //         $(self).data('flag', false);
            //     }, time);
            // });
            
            // $(document).on("click", ".sideboard .card-mana-link", function(e) {
            //     e.preventDefault();
            
            //     var self = this, time = 500;
            
            //     if ($(this).data('flag')) {
            //         //default href cancelled and new action taken instead
            //         clearTimeout($(this).data('timer'));
            //         var cardName = self.text;
            //         $scope.moveToDeck(cardName);
            //     } else {
            //         //default href fired after timer
            //         $(this).data('timer', setTimeout(function() {
            //             window.location.href = $(self).attr('href');
            //         }, time));
            //     }
            
            //     $(this).data('flag', true);
            
            //     setTimeout(function() {
            //         $(self).data('flag', false);
            //     }, time);
            // });