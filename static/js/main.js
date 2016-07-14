  // Project Copilot Concierge Client
  // Copyright 2016 Project Copilot

  // Contact information validation helper methods
  var contactValidate = {
    email: function(mail) {
      if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail))
      {
        return true;
      }
        return false;
    },
    phone: function(phone) {
      return phoneUtils.isValidNumber(phone, "US");
    }
  }

    // Load questions
    $.getJSON("data/questions.json", function (questionList) {
    
          // initialize standard form variables on page load
          var helper = $("#helper");
          var mainInput = [
              $("#mainField"),
              $("#mainOption"),
              $("#mainTextArea")
          ];
          var inputJSON = {};
          var questionQueue = [];
          for (var j = 0; j < questionList.length; j++) {
            questionQueue.push(questionList[j]);
          }
          var currentQuestion = 0;
          var queueLength = questionQueue.length;
          var ix = getInputIndex(questionQueue[currentQuestion].type);


          // return ix given type
          function getInputIndex(type) {
            if (type === "option") {
              return 1;
            } else if (type === "textarea") {
              return 2;
            } else {
              return 0;
            }
          }


          // Process current question and pull up next question
          function next() {

            helper.fadeOut(function() {
              if (currentQuestion < queueLength) {
                helper.text(questionQueue[currentQuestion].helper);
                // Is the question type an option or a textfield?
                ix = getInputIndex(questionQueue[currentQuestion].type);
                console.log(currentQuestion, questionQueue[currentQuestion].type, ix);
                queueLength = questionQueue.length;

                if (ix == 1) {
                  mainInput[0].css("display", "none");
                  mainInput[1].css("display", "inline-block");
                  mainInput[2].css("display", "none");
                  $("#mainOption").html("<option value=\"\" id=\"optionHelper\" disabled selected>Option Placeholder</option>");
                  $("#optionHelper").text(questionQueue[currentQuestion].value);
                  for (var i = 0; i < questionQueue[currentQuestion].options.length; i++) {
                    mainInput[ix].append('<option value="'+questionQueue[currentQuestion].options[i]+'">'+questionQueue[currentQuestion].options[i]+'</option>');
                  }
                } else if (ix == 0) {
                  mainInput[0].css("display", "inline-block");
                  mainInput[1].css("display", "none");
                  mainInput[2].css("display", "none");
                  mainInput[ix].val("").attr("placeholder", questionQueue[currentQuestion].value);

                } else if (ix == 2) {
                  mainInput[2].css("display", "block");
                  mainInput[0].css("display", "none");
                  mainInput[1].css("display", "none");
                  mainInput[ix].val("").attr("placeholder", questionQueue[currentQuestion].value);
                }

              } else {
                helper.text("Hit \"Finish\" to complete.");
                mainInput[ix].val("").hide();
                $("#mainFieldSubmit").hide();
                $("#submit").fadeIn();
              }

            }).fadeIn();


            var input = mainInput[ix].val();

            // add data to inputJSON, the object that will eventually be sent up to the server
            inputJSON[questionQueue[currentQuestion].key] = input;

            // iteratively move through all of the questions
            if (mainInput[ix].val() == questionQueue[currentQuestion].followUpValue && questionQueue[currentQuestion].followUpValue !== "NONE") {

              var followUpArray = questionQueue[currentQuestion].followUpQuestions;
              questionQueue.length = 0; // wipe array
              for (var k = 0; k < followUpArray.length; k++) {
                  questionQueue.push(followUpArray[k]);
              }

              currentQuestion = 0;

            } else {
              if (mainInput[1].val() !== null || mainInput[0].val() !== "") currentQuestion++;
            }


          }


          // load initial question
          next();


          // Standard handlers for when the user hits return or "OK"
          $('.contact input').keyup(function(e){
            if (e.keyCode == 13 && mainInput[ix].val().length !== 0) {
              next();
            }
          });

          $("#mainFieldSubmit").click(function() {
              if (mainInput[ix].val().length !== 0) {
                next();
              }
          });



          // SUBMIT button is clicked: Sends form data off to the server.
          $('#submit').click(function() {
            console.log(inputJSON);

            // make the call
            $.ajax({
              type: "POST",
              url: "http://localhost:3000/api/addUserRequest",
              data: inputJSON,
              error: function(err) { // Not sure why, but the response always gets passed through the error method (even if it was successful)
                if (err.status == 200) { // if everything's all good, then fade everything out and redirect to the beginning of the form
                  helper.text("Successfully submitted.");
                  setTimeout(function() {
                      $("body").fadeOut(function() {
                        location.href = "/";
                      });
                  }, 1000);
                } else { // something bad happened
                  console.log(err);
                  helper.html("There was an error submitting. Try again later.");
                }
              },
              dataType: 'json',
            });

            return false;
          });

    });
