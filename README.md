# JavaScript Turtle Graphic

This is an attempt to recreate the famous Python Turtle Graphics  in JavaScript, using the canvas.  
For the moment the only available commands are `forward`, `backward` `right` and `left`.

## Exemple 
We can use this to draw a spiral recursively with this simple code:

```javascript
  function drawSpiral(turtle, lineLen) {
    if (lineLen > 0) {
      turtle.forward(lineLen);
      turtle.left(90);
      drawSpiral(turtle, lineLen-5);
    }
  }
  drawSpiral(turtle, 100);
  turtle.draw();
```
