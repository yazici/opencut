var opencutPaper = function(canvasId) {
  paper.setup(document.getElementById(canvasId));

  function resizeView() {
    var minX = -0.01;
    var minY = -0.01;
    var maxX = 0.01;
    var maxY = 0.01;
    var allItems = paper.project.getItems();
    for (var k = 0; k < allItems.length; k++) {
      var bounds = allItems[k].getBounds();
      minX = Math.min(minX, bounds.x);
      minY = Math.min(minY, bounds.y);
      maxX = Math.max(maxX, bounds.x + bounds.width);
      maxY = Math.max(maxY, bounds.y + bounds.height);
    }
    paper.view.setCenter(new paper.Point(
      minX + (maxX - minX) / 2, minY + (maxY - minY) / 2));

    var scaleX = (paper.view.getBounds().width / ((maxX - minX) * 1.1)) * paper.view.getZoom();
    var scaleY = (paper.view.getBounds().height / ((maxY - minY) * 1.1)) * paper.view.getZoom();
    paper.view.setZoom(Math.min(scaleX, scaleY));
  }

  function renderJob(job) {
    paper.project.clear();
    if (!job) {
      paper.view.draw();
      return;
    }

    // Render the shapes which the cuts will be centered around.
    var cutShapes = new paper.Group();
    for (var i = 0; i < job.cuts.length; i++) {
      var cut = job.cuts[i];
      if (cut.points && cut.points.length > 0) {
        if (cut.type == "drill") {
          for (var k = 0; k < cut.points.length; k++) {
            var drillSpot = new paper.Shape.Circle(
              new paper.Point(cut.points[k]), job.bit_diameter / 2);
            drillSpot.strokeColor = "black";
            drillSpot.fillColor = "grey";
            cutShapes.addChild(drillSpot);
          }
        } else {
          var path = new paper.Path();
          path.moveTo(new paper.Point(cut.points[0]));
          for (var j = 1; j < cut.points.length; j++) {
            path.lineTo(new paper.Point(cut.points[j]));
          }
          cutShapes.addChild(path);
        }
      }

      if (cut.shape) {
        if (cut.shape.type == "circle") {
          cutShapes.addChild(new paper.Shape.Circle(
            new paper.Point(cut.shape.center), cut.shape.radius));
        } else if (cut.shape.type == "rectangle") {
          cutShapes.addChild(new paper.Shape.Rectangle(
            new paper.Point(cut.shape.origin), new paper.Size(cut.shape.size)));
        } else {
          console.log("unknown shape: " + cut.shape.type);
        }
      }

      if (cutShapes.lastChild) {
        cutShapes.lastChild.strokeColor = (cut.color !== undefined) ? cut.color : "black";
      }
    }

    // Invert everything (to move the origin to the bottom left).
    cutShapes.scale(1, -1);

    resizeView();

    // The view must be resized before setting the stroke width
    // so we know how wide to stroke.
    cutShapes.style.strokeWidth = 1 / paper.view.getZoom();

    paper.view.draw();
  }
  this.renderJob = renderJob;

  function setSize(bounds) {
    paper.view.viewSize = [bounds.width, bounds.height];
    resizeView();
  }
  this.setSize = setSize;
};
