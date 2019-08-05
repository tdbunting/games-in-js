# Pong

This is a simple pong clone made with plain JavaScript.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Setup
In your html file, create a new canvas and give it an id.
```html
<canvas id="my-canvas" width='560' height='480'>
```
Then in a script tag within your HTML or in an external javascript file, create a reference to your canvas element and pass that along to the Pong constructor.

```html
<script src='pong.js'></script>
<script>
  var canvas = document.getElementById('my-canvas');
  var pong = new PongGame(canvas, options)
</script>
```

### Options

| Parameter | Type    | Default |
|-----------|---------|---------|
| aiIsOn    | Boolean | true    |
| winCount  | Number  | 10      |

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
