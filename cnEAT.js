Qualtrics.SurveyEngine.addOnload(function()
{
	/*Place your JavaScript here to run when the page loads*/

});

Qualtrics.SurveyEngine.addOnReady(function()
{
	/*Place your JavaScript here to run when the page is fully displayed*/

});

Qualtrics.SurveyEngine.addOnUnload(function()
{
	/*Place your JavaScript here to run when the page is unloaded*/

});

Qualtrics.SurveyEngine.addOnload(function()
{
  /*Place Your Javascript Below This Line*/
  var URL_OF_VIDEO = 'video link';
  var NAME_OF_VIDEO = 'NeutralVideo';
  var DURATION_OF_VIDEO_IN_MILLISECONDS = 180000 + 500; // in milliseconds. Note the 500 at the end is a buffer
  var TIME_INTERVAL_IN_MILLISECONDS = 500; // default: sample every 500 milliseconds
  var current_valence_vector = [];
  var current_time_vector = [];
  
  // disables the next button on the page
  var that = this;
  this.disableNextButton();
  
  function mySliderFunction(paper, inputX, inputY, pathString, colour, pathWidth) {
    var addLabel = false; // boolean to change if you want the slider to be labeled with the current value.
    
    var slider = paper.set();
    
    slider.currentValue = 50; // setting the initial value of the slider
    slider.push(paper.path("M" + inputX + " " + inputY + pathString)).attr({stroke:colour,"stroke-width": pathWidth});
    slider.PathLength   = slider[0].getTotalLength();

    slider.PathPointOne = slider[0].getPointAtLength(0); // left edge of slider
    slider.PathPointTwo = slider[0].getPointAtLength(slider.PathLength);  // right edge of slider; depends on the pathString that's input.
    slider.PathBox      = slider[0].getBBox();
    slider.PathBoxWidth = slider.PathBox.width;
    slider.push(paper.circle(slider.PathPointOne.x, slider.PathPointOne.y, pathWidth/2).attr({fill:colour, "stroke-width": 0,"stroke-opacity": 0})); // left edge
    slider.push(paper.circle(slider.PathPointTwo.x, slider.PathPointTwo.y, pathWidth/2).attr({fill:colour, "stroke-width": 0,"stroke-opacity": 0})); // right edge

    /*Slider Button*/
    // creating the "back" of the slider button, sButtonBack
    //    paper.circle(  x position,   y position,   radius of circle   )
    //  so the initial x position is in the center of the slider
    //  the .attr() call is to change the fill color, stroke width, and other graphical attributes
    slider.sButtonBack = paper.circle(slider.PathPointOne.x + slider.PathLength/2, slider.PathPointOne.y, pathWidth);
    slider.sButtonBack.attr({fill: "#777","stroke-width": 1,"fill-opacity": 1, stroke: "#000", r:(15)});
    slider.push(slider.sButtonBack); // drawing sButtonBack on the canvas  

    if(addLabel) {
    // adding a text label to the slider handle (i.e. number from 0 to 100)
      sliderText=paper.text((slider.PathPointOne.x + slider.PathPointTwo.x)/2, slider.PathPointOne.y, slider.currentValue ).attr({fill:'#FFF', 'font-size':16, 'stroke-width':0 });
      slider.push(sliderText);
    }
    // similarly creating the slider button itself.
    slider.sButton = paper.circle(slider.PathPointOne.x + slider.PathLength/2, slider.PathPointOne.y, pathWidth);
    slider.sButton.attr({fill: "#777","stroke-width": 1,"fill-opacity": 0.1, stroke: "#000", r:(15)} );
    
    // We also want to add other attributes/functionality to the sButton
    var start = function () { this.ox = this.attr("cx"); },
    move = function (dx, dy) {
      proportionAlongLine = (this.ox + dx - inputX)/slider.PathBoxWidth;
      // reusing "PathPointOne" to store current point
      slider.PathPointOne = slider[0].getPointAtLength(proportionAlongLine * slider.PathLength);

      if (!slider.PathPointOne.x) { slider.PathPointOne.x=x1; }
      if (!slider.PathPointOne.y) { slider.PathPointOne.y=y1; }
      this.attr({cx: slider.PathPointOne.x, cy: slider.PathPointOne.y}); 
     slider.sButtonBack.attr({cx: slider.PathPointOne.x, cy: slider.PathPointOne.y});

     // just adding a check so that the "cx" doesnt go beyond the left edge.
     if (Math.round(((this.attr("cx")-slider.PathBox.x)/slider.PathBox.width)*100)) {
        slider.currentValue=Math.round(((this.attr("cx")-slider.PathBox.x)/slider.PathBox.width)*100);  
      } else {
        slider.currentValue=0;
      }
      if(addLabel) { // adding an label to the slider handle
        sliderText.attr({text:slider.currentValue, x: slider.PathPointOne.x, y: slider.PathPointOne.y});
      }
    },
    up = function () {
      // 
    }; 
    // assign the 'move', 'start', and 'up' functions to the slider button
    //   see raphael.js documentation for more details, but the inputs are:
    //   1) what to do when element is moved ("mouse move")
    //   2) what to do on the start of the element being dragged ("mouse start")
    //   3) what to do when the element is released ("mouse up")
    slider.sButton.drag(move, start, up);
    slider.push(slider.sButton); // draw sButton onto the canvas.
    return slider;
  };
  

  // loading the video into the html element
  videoElement = document.getElementById("videoElement");
  videoElement.setAttribute("src", URL_OF_VIDEO);
  videoElement.load();
  
  // creating the canvas onto which to paint the slider
  canvas = Raphael('happySliderDiv'); 

  LeftEdge = 200;
  RightEdge = 500;
  textYCoord = 40;
  
  // creating the end points of the slider
  canvas.text(LeftEdge, textYCoord, "No Emotion").attr({ "font-size": 24 });
  canvas.text(RightEdge, textYCoord, "Very Intense Emotion").attr({ "font-size": 24 });

  // creating the slider variable  
  mySlider = mySliderFunction(canvas, LeftEdge, 75, 'h300',"#AAAAAA", 15);

  // this function startTiming gets called when the start button is pressed.
  function startTiming() {
    videoElement.play();
    timeAtStart = new Date().getTime();
    current_valence_vector.push(mySlider.currentValue);
    current_time_vector.push(0);
    
    // this is the sampling function, every TIME_INTERVAL_IN_MILLISECONDS milliseconds
    myInterval = setInterval(function() {
      timeNow = new Date().getTime() - timeAtStart;
      current_valence_vector.push(mySlider.currentValue);
      current_time_vector.push(timeNow);
    }, TIME_INTERVAL_IN_MILLISECONDS);

    // this function waits for DURATION_OF_VIDEO_IN_MILLISECONDS milliseconds, then stops the sampling script and saves the data.
    setTimeout(function() {
      clearInterval(myInterval);
      Qualtrics.SurveyEngine.setEmbeddedData('NeutralVideo', NAME_OF_VIDEO);
      Qualtrics.SurveyEngine.setEmbeddedData('NeutralVideo_intensity_vector', current_valence_vector.toString()); // ADDED AUG 2021: convert vector to string
      Qualtrics.SurveyEngine.setEmbeddedData('NeutralVideo_time_vector', current_time_vector.toString()); // ADDED AUG 2021: convert vector to string
      canvas.text(350, 200, "Ok, you are done with this page.").attr({ "font-size": 24 });
      canvas.text(350, 240, "Please click the blue arrow to proceed!").attr({ "font-size": 24 });
      // enables the next button on the page
      that.enableNextButton();
    }, DURATION_OF_VIDEO_IN_MILLISECONDS);
  };
  

  goButton = canvas.rect(300,125,100,25,0).attr({fill: "#0f0"});
  goButton.click(function() {
    startTiming();
    goButton.hide();
  });
  
});