var update_time = 100

var Box = React.createClass({
  render : function () {
    return (
      <div
      className="box"
      style={{...this.props}}>
        <Snake
        side={20}
        box_width={this.props.width}
        box_height={this.props.height}
        />
      </div>
    )
  }
})

var Points = React.createClass({
  render : function () {
    return (
      <h4>
        Points <b>{this.props.points}</b>
      </h4>
    )
  }
})

var Snake = React.createClass({
  render : function () {
    return (
      <Head
        className="snake"
        {...this.props}
      />
    )
  }
})

var Meal = React.createClass({
  render : function () {
    return (
      <div
      className="meal"
      style={{
        left: this.props.left,
        top: this.props.top,
        width : this.props.side,
        height : this.props.side
      }}>
      </div>
    )
  }
})

var Tail = React.createClass({
  render : function () {
    return (
      <div>
      {this.props.list.map((obj, i) =>
        <div className="snake snake-tail"
        obj={obj}
        key={i}
        style={{
          width: this.props.side,
          height: this.props.side,
          top: obj.top,
          left: obj.left}}>
        </div>
      )}
      </div>
    )
  }
})

var Head = React.createClass({
  getInitialState: function() {

    var tails = [];
    for(var k = 0; k < 4; k ++) { tails.push({ top:0, left:0}) }

    return ({
      top : 0,
      left : 0,
      direction : 2,
      length : 4,
      tails : tails,
      meal : this._randomMeal(),
      life : setInterval(this.cycleLife, update_time),
      change : false,
      points: 0,
      gameOver: false,
    })
  },

  componentDidMount: function() {
    $(document.body).on('keydown', this.handleKeyDown);
  },

  componentWillUnmount: function() {
    $(document.body).off('keydown', this.handleKeyDown);
  },

  render : function () {
    var props = {
      width: this.props.side,
      height: this.props.side,
      top: this.state.top,
      left: this.state.left
    }

    return (
      <div>
        <div
        className="snake snake-head"
        style={{...props}}
        onKeyDown={this.handleKeyDown}
        />
        <Tail side={this.props.slide} list={this.state.tails}/>
        <Meal
          side={this.props.side}
          top={this.state.meal.top}
          left={this.state.meal.left}
        />

        <div className="points" style={{width: this.props.box_width}}>
          <button
            id=""
            className="pull-right"
            style={{
              marginTop: 4,
              display: (this.state.gameOver) ? 'block' : 'none'
            }}
            onClick={this.restart}>
            Play again
          </button>
          <Points points={this.state.points} box_width={this.props.box_width} />
        </div>
      </div>
    )
  },

  restart : function () {
    this.setState(this.getInitialState());
    $('.snake').removeClass('red');
  },

  handleKeyDown : function (e) {
    if ( ! this.state.change)
    {
      this.setState({change : true})

      switch(e.keyCode)
      {
        case 38: // up
        if(this.state.direction != 3) this.setState({direction: 1})
        break;

        case 39: // dx
        if(this.state.direction != 4) this.setState({direction: 2})
        break;

        case 40: // dw
        if(this.state.direction != 1) this.setState({direction: 3})
        break;

        case 37: // sx
        if(this.state.direction != 2) this.setState({direction: 4})
        break;
      }
    }
  },

  updateTail : function () {
    var tails = this.state.tails;

    tails.unshift({
      top: this.state.top,
      left:this.state.left
    });
    tails.pop();

    this.setState({tails : tails})
  },

  cycleLife : function () {
    this.setState({change : false})

    switch(this.state.direction)
    {
      case 1: // up
        var top = this.state.top - this.props.side < 0 ? this.props.box_height - this.props.side : this.state.top - this.props.side
        this.setState({top: top});
      break;

      case 2: // dx
        var left = this.state.left + this.props.side > this.props.box_width - this.props.side ? 0 : this.state.left + this.props.side
        this.setState({left: left});
      break;

      case 3: // dw
        var top = this.state.top + this.props.side > this.props.box_height - this.props.side ? 0 : this.state.top + this.props.side
        this.setState({top: top});
      break;

      case 4: // sx
        var left = this.state.left - this.props.side < 0 ? this.props.box_width - this.props.side : this.state.left - this.props.side
        this.setState({left: left});
      break;
    }

    this.checkCollide()
    this.checkEaten()
    this.updateTail()
  },

  checkCollide : function () {
    var state = this.state;
    var gameOver = false;

    state.tails.forEach(function (tail, i)  {
      if(tail.top == state.top && tail.left == state.left)
      {
        gameOver = true;
      }
    })

    if(gameOver)
    {
      clearInterval(this.state.life)
      $('.snake').addClass('red');
      this.setState({ gameOver : gameOver });
    }
  },

  checkEaten : function () {
    if(this.state.meal.top == this.state.top && this.state.meal.left == this.state.left)
    {
      this.stretchSnake()
      this.moveMeal();
      this.setState({points : this.state.points + 9})
    }
  },

  _checkMealMovement : function (data) {
    var test = true;

    this.state.tails.forEach(function (tail) {
      if(data.top == tail.top && data.left == tail.left) {
        test = false
      }
    })

    return test;
  },

  _randomMeal : function () {
    return ({
      top : Math.floor((Math.random() * Math.floor((this.props.box_height - this.props.side) / this.props.side)) + 1) * this.props.side,
      left : Math.floor((Math.random() * Math.floor((this.props.box_width - this.props.side) / this.props.side)) + 1) * this.props.side
    })
  },

  _generateMealPosition : function () {
    var data = this._randomMeal();

    if ( ! this._checkMealMovement(data)) return this._generateMealPosition()

    return data;
  },

  moveMeal : function () {
    this.setState({meal : this._generateMealPosition()})
  },

  stretchSnake : function () {
    this.setState({length: this.state.length + 3})

    var tails = this.state.tails;

    for(var k = 0; k<3; k++)
    {
      tails.push({top: this.state.top, left:this.state.left})
    }
  }
})




ReactDOM.render(
  <Box width={600} height={460} />,
  document.getElementById('container')
);
