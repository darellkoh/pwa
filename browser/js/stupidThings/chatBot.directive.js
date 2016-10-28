// app.directive('chatBot', function(){
//   return {
//     restrict: 'E',
//     template: `
//     <!-- -->
//     <div>
//         <h1 class="text-center" style="background-color: skyblue" id="botText">{{botText[selectArray]}}</h1>
//         <img style="width:350px; height:350px" id="botImage" src="chatbot/chat-0{{selectArray+1}}.png" />
//         <button style="padding:20px; margin:30px" id="botTextButton">Cilck me for help</button>
//     <div>
//     `,
//     controller: function($scope){
//       $scope.selectArray = 0;
//       $scope.getSelectArray = function(){
//         return s.selectArray;
//       }
//       $scope.botText = ["Hi! How can I help you today", "Are you sure you don't want any help?", "Seriously if there is anything you need just hit the button", "I mean really I can do whatever for you, I'm like friggen google over here", "Ooooooooh I forgot I got this thing! Hey good luck with that!"];
//       $scope.buttonText = ["Click here to start a chat!", "Are you sure no chat?", "WAS IT SOMETHING I SAID?!", "PLEASE PLEASE CLICK ME!!"]
//     },
//     link: function(s, e, a){
//           $("#floatButton").on('click', function(){
//              $("#chat-bot").css({
//               "visibility":"visible"
//              })
//              $("#chat-bot").animate({ left: 350 + 'px', top: 150 + 'px' });
//              $(this).css({
//               "visibility":"hidden"
//              })
//           })
//           e.on('mouseenter', function() {
//             // console.log("this is e", s.botText, s.selectArray)
//               var botTextLength = s.botText.length;
//               if (s.selectArray < botTextLength-2) s.selectArray++;
//               angular.element('#botText').text(s.botText[s.selectArray]);
//               angular.element('#botTextButton').text(s.buttonText[s.selectArray]);
//               angular.element('#botImage').attr('src',`chatbot/chat-0${s.selectArray+1}.png` )
//               var dWidth = angular.element(document).width() / 10, // 100 = image width
//                   dHeight = angular.element(document).height() / 30, // 100 = image height
//                   nextX = Math.floor(Math.random() * dWidth + 100),
//                   nextY = Math.floor(Math.random() * dHeight + 50);
//               $("#chat-bot").animate({ left: nextX + 'px', top: nextY + 'px' });
//               $("#botTextButton").on('click', function(){
//                 s.selectArray++;
//                 angular.element('#botText').text(s.botText[s.selectArray])
//                 console.log("botTextButton");
//                  if(s.selectArray === 5){
//                   angular.element('#botTextButton').hide()
//                     angular.element('#botImage').attr('src','chatbot/chat-05.png' )
//                     setTimeout(function(){

//                       $("#chat-bot").animate({ left: nextX + 2500 + 'px', top: nextY + 2500 + 'px' });
//                     },2500)
//                 }


//               })

//           });

//       // height: ($("#chat-bot").css("height") + 50)
//       e.css({
//         "visibility": "hidden",
//         "margin": "30px",
//         "padding": "20px",
//         "position": "fixed",
//         "background-color": "rgba(0,0,0,0)",
//         "height": "800px",
//         "width": "800px",
//         "top": "-1000",
//         "left": "-1000",
//         "z-index": "999"
//       })

//     }
//   }
// })
