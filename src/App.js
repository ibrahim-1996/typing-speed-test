import React, { Component, Fragment } from 'react';
import firebase from 'firebase/app';
import 'firebase/firestore';
import Typist from 'react-typist';
import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'
import InputGroup from 'react-bootstrap/InputGroup'
import FormControl from 'react-bootstrap/FormControl'
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

const firebaseConfig = {
  apiKey: "AIzaSyAA6hwI0AfHDJPecEq2JevGfeFnDIJbAiw",
  authDomain: "tstest-e07a3.firebaseapp.com",
  databaseURL: "https://tstest-e07a3.firebaseio.com",
  projectId: "tstest-e07a3",
  storageBucket: "",
  messagingSenderId: "345848862403",
  appId: "1:345848862403:web:3dfd72fbaa7f0ec6"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();

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

function SaveModal(props) {
  return (
    <Modal
      show={props.show}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          Save
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <h4 className="mb-3 text-center">save your score</h4>
        <InputGroup className="mb-3">
          <InputGroup.Prepend>
            <InputGroup.Text>name</InputGroup.Text>
          </InputGroup.Prepend>
          <FormControl onChange={props.setName} />
        </InputGroup>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="success" onClick={props.saveScore}>Save</Button>
        <Button variant="dark" onClick={props.onHide}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
}

class App extends Component {

  state = {
    testTxt: '',
    typedTxt: '',
    borderClr: 'secondary',
    timerRunning: false,
    showSave: false,
    name: 'unnamed',
    startTime: '',
    finishTime: 0,
    typos: 0,
    scoreboard: [],
  }

  componentDidMount() {
    this.fetchRandomTxt()
    this.fetchScoreboard()
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
          this.ShowSave(true);
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

  setName = (e) => {
    this.setState(
      { name: e.target.value }
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

  ShowSave = (val) => { this.setState({ showSave: val }) };

  saveScore = () => {
    let score = {
      name: this.state.name,
      date: this.state.startTime,
      time: this.state.finishTime,
      typos: this.state.typos
    }    
    this.setState({scoreboard: this.state.scoreboard.concat([score])})
    this.setState({ showSave: false })

    db.collection('scoreboard').add(score).then(rsp => {
    })
  }

  fetchScoreboard = () => {
    db.collection('scoreboard').orderBy("time", "desc").get().then(snapshot => {
      let scores = [];
      snapshot.docs.forEach(item => scores.push(item.data()))
      this.setState({ scoreboard: scores })
    })
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

              <SaveModal show={this.state.showSave} onHide={() => this.ShowSave(false)} saveScore={this.saveScore} setName={this.setName} />

              <h3 className='p-3 text-center'>scoreboard</h3>

              {this.state.scoreboard.length === 0 ? <div className="spinner mt-3">
                <div className="bounce1"></div>
                <div className="bounce2"></div>
                <div className="bounce3"></div>
              </div> :

                <div className="col-md-9 col-lg-6 mx-auto table-responsive">
                  <table className="table table-striped">
                    <thead className="thead-dark">
                      <tr>
                        <th scope="col">#</th>
                        <th scope="col">Name</th>
                        <th scope="col">Time</th>
                        <th scope="col">Typos</th>
                      </tr>
                    </thead>
                    <tbody>

                      {this.state.scoreboard.map((item, index) => <tr key={index + 1}>
                        <th scope="row">{index + 1}</th>
                        <td>{item.name}</td>
                        <td>{item.time} seconds</td>
                        <td>{item.typos}</td>
                      </tr>)}

                    </tbody>
                  </table>
                </div>}

            </Fragment>}

        </main>

      </div>
    );
  }
}

export default App;
