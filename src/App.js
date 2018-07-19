import React, { Component, Fragment } from 'react';
import Typist from 'react-typist'
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';


class Timer extends Component {

  state = { elapsed: 0 }
  componentDidMount() {
    this.timer = setInterval(this.tick.bind(this), 50);
  }

  componentWillUnmount() {
    clearInterval(this.timer);
  }

  tick() {
    this.setState({ elapsed: new Date() - this.props.start });
  }

  render() {
    var elapsed = Math.round(this.state.elapsed / 100);
    var seconds = (elapsed / 10).toFixed(1);


    return <b>{seconds} seconds</b>;
  }
};

class App extends Component {

  state = {
    testTxt: '',
    typedTxt: '',
    borderClr: 'secondary',
    timerRunning: false,
    startTime: '',
    finishTime: 0,
    typos: 0
  }

  componentDidMount() {
    this.fetchRandomTxt()
  }

  componentDidUpdate(prevProps, prevState) {

    if (prevState.typedTxt !== this.state.typedTxt) {
      if ((!this.state.timerRunning)) this.startTimer()
      switch (this.state.typedTxt) {
        case '':
          this.reset()
          break

        case this.state.testTxt:
          this.setState({ borderClr: 'info' })
          this.stopTimer()
          break
        case this.state.testTxt.substring(0, this.state.typedTxt.length):
          this.setState({ borderClr: 'success', })
          break
        default:
          this.setState({ borderClr: 'danger' })
          prevState.typedTxt.length < this.state.typedTxt.length &&
            this.setState({ typos: this.state.typos + 1 })
      }
    }
  }

  fetchRandomTxt = () => {
    fetch("https://www.randomtext.me/api/gibberish/p-1/10-10")
      .then(rsp => rsp.json())
      .then(testTxt => this.setState({ testTxt: testTxt.text_out.slice(3, -6) }))
      this.reset()
  }

  updateTypedTxt = (e) => {
    this.setState(
      { typedTxt: e.target.value }
    )
  }

  startTimer = () => {
    this.setState({ timerRunning: true, startTime: Date.now() })
  }

  stopTimer = () => {
    this.setState({
      timerRunning: false
    })
    this.refs.timer && this.setState({
      finishTime: (this.refs.timer.state.elapsed / 1000).toFixed(1)
    })
  }
  reset = () => {
    this.setState({ finishTime: 0, typos: 0, timerRunning: false, startTime: '', typedTxt: '', borderClr: 'secondary' })

  }

  render() {
    return (
      <div className="App">
        <header className='bg-primary'>
          <h1 className='h3 p-3 text-white text-center'>
          <Typist avgTypingDelay={100} cursor={{
            show: true,
            blink: true,
            element: '|',
            hideWhenDone: true,
            hideWhenDoneDelay: 1000,
          }}>
            <small>Welcome to </small>Typing Speed Test
          </Typist>
          </h1>
        </header>
        <main className="container-fluid d-flex flex-column align-items-center">

          {this.state.testTxt === '' ? <div className="spinner mt-3">
            <div className="bounce1"></div>
            <div className="bounce2"></div>
            <div className="bounce3"></div>
          </div> : <Fragment>
              <section className="d-flex flex-column">
                <p className='p-3 mt-3' style={{ backgroundColor: '#ededed', userSelect: 'none' }}>{this.state.testTxt}</p>
                <div className="form-group">
                  <textarea className={`form-control border-${this.state.borderClr}`}
                    style={{ 'borderWidth': '3px' }} rows="3" placeholder="The clock starts when you start typing." value={this.state.typedTxt}
                    onChange={this.updateTypedTxt}></textarea>
                </div>
                <div className="align-self-end mb-3">
                  <button className='btn btn-outline-secondary mr-2' onClick={this.fetchRandomTxt} disabled={this.state.timerRunning}>Randomize!</button>
                  <button className='btn btn-outline-danger' onClick={this.reset}>Reset</button>
                </div>
              </section>
              <section className="d-flex">
                <div className='mx-2'>{!this.state.timerRunning && <b>{this.state.finishTime} seconds</b>}
                  {this.state.timerRunning && <Timer ref='timer' start={this.state.startTime} />}</div>
                <div className='mx-2'>Typos: {this.state.typos}</div>
              </section>
            </Fragment>}
        </main>

      </div>
    );
  }
}

export default App;
