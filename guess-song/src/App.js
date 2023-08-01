import "./styles.scss";
import ReactAudioPlayer from "react-audio-player";
import axios from "axios";
import React, { useRef, useState, useEffect, forwardRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import querystring from "query-string";
import Countdown from "./Countdown";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import App2 from "./App2";

var Buffer = require("buffer").Buffer;
var { songList } = require("./songlist");

export default function App() {
  const [tdate, setTdate] = useState(new Date());
  const offset = tdate.getTimezoneOffset();
  const offsetDate = new Date(tdate.getTime() - offset * 60 * 1000);
  const formatDate = offsetDate.toISOString().split("T")[0];
  const ExampleCustomInput = forwardRef(({ value, onClick }, ref) => (
    <Button
      color="secondary"
      className="example-custom-input"
      onClick={onClick}
      ref={ref}
    >
      {value}
    </Button>
  ));
  const todaysSong = songList[formatDate];
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionIndex, setSuggestionIndex] = useState(0);
  const [suggestionsActive, setSuggestionsActive] = useState(false);
  const [value, setValue] = useState("");
  const [chances, setChances] = useState(4);
  const [displayMessage, setDisplayMessage] = useState("");
  const [endTime, setEndTime] = useState(3000);

  const [isPlaying, setIsPlaying] = useState(true);
  const imageUrl = todaysSong.picture;
  const bref = useRef();
  const [shareMessage, setShareMessage] = useState("");
  const [show, setShow] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isAnswerFound, setIsAnswerFound] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const onChangeDate = (date) => {
    setTdate(date);
    setIsPlaying(true);
    setEndTime(3000);
    setChances(4);
    setValue("");
    setShow(false);
    setCopied(false);
    setIsAnswerFound(false);
    setDisplayMessage("");
  };

  useEffect(() => {
    if (localStorage.getItem(formatDate) === "true") {
      setIsAnswerFound(true);
      setEndTime(15000);
    } else {
      localStorage.setItem(formatDate, false);
    }
  }, [isAnswerFound]);

  const inputRef = useRef(null);
  const client_id = process.env.REACT_APP_CLIENT_ID;
  const client_secret = process.env.REACT_APP_CLIENT_SECRET;
  const answer = todaysSong.answer;
  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
    Authorization:
      "Bearer placeholder",
  };
  const handleChange = (e) => {
    const query = e.target.value.toLowerCase();
    setValue(query);
    if (query.length > 1) {
      onsearch(value);
      setSuggestionsActive(true);
    } else {
      setSuggestionsActive(false);
    }
  };
  const handleClick = (e) => {
    setSuggestions([]);
    setValue(e.target.innerText);
    setSuggestionsActive(false);
  };

  const Suggestions = () => {
    return (
      <ul className="suggestions">
        {suggestions.map((suggestion, index) => {
          return (
            <li
              className={index === suggestionIndex ? "active" : ""}
              key={index}
              onClick={handleClick}
            >
              {suggestion}
            </li>
          );
        })}
      </ul>
    );
  };
  const onclickPlay = () => {
    var player = bref.current.audioEl.current;

    setTimeout(function () {
      player.pause();
      player.currentTime = 0;
      setIsPlaying(!isPlaying);
    }, endTime);
  };
  const onsearch = async (e) => {
    var options = {
      url: `https://api.spotify.com/v1/search?q=${e}&type=track,album&market=IN&include_external=audio`,
      headers: headers,
    };
    try {
      const res = await axios(options);
      const data = res.data.tracks.items;
      const resultArray = [];
      Object.keys(data).map((each) => {
        if (["single", "compilation","album"].includes(data[each].album.album_type)) {
          const name = data[each].name;
          if (answer === name.toLowerCase()) {
          }
          resultArray.push(name);
        }
      });
      setSuggestions(resultArray);
    } catch (error) {
      var refresh_token = process.env.REACT_APP_REFRESH_TOKEN;
      var authOptions = {
        method: "post",
        url: "https://accounts.spotify.com/api/token",
        data: querystring.stringify({
          grant_type: "refresh_token",
          refresh_token: refresh_token,
        }),
        headers: {
          "content-type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${new Buffer.from(
            `${client_id}:${client_secret}`
          ).toString("base64")}`,
        },
      };
      const result = await axios(authOptions);
      headers.Authorization = `Bearer ${result.data.access_token}`;
      await onsearch(e);
    }
  };
  const onclicksubmit = () => {
    const newChn = chances - 1;
    if (value.toLowerCase().includes(answer.toLowerCase())) {
      setDisplayMessage("Correct answer");
      setIsAnswerFound(true);
      setEndTime(25000);
      localStorage.setItem(formatDate, true);
    } else {
      setChances(newChn);
      setValue(null);
      inputRef.current.value = "";
      setEndTime(endTime + 3000);
      setDisplayMessage(`${newChn} chances left`);
    }
  };
  const onClickSkip = () => {
    const newChn = chances - 1;
    setChances(newChn);
    setValue(null);
    inputRef.current.value = "";
    setEndTime(endTime + 3000);
    setDisplayMessage(`${newChn} chances left`);
  };

  const onclickPlayButton = () => {
    isPlaying
      ? bref.current.audioEl.current.play()
      : bref.current.audioEl.current.pause();
    setIsPlaying(!isPlaying);
  };
  const onclickShare = async () => {
    const text = getSharetext();
    const shareContent = {
      title: "Isaithulir",
      text: `Isaithulir - ${
        isAnswerFound ? 5 - chances : 4
      }/4\n  ${getSharetext()} \n #isaithulir \n`,
      url: "https://isaithulir.herokuapp.com/",
    };
    if (navigator.share) {
      navigator.share(shareContent).then(() => {});
    } else {
      navigator.clipboard.writeText(
        `${shareContent.title} \n ${shareContent.text} \n ${shareContent.url}`
      );
      setCopied(true);
    }
  };

  const getSharetext = () => {
    let text = "";
    if (chances < 4) {
      for (let i = 1; i < 5 - chances; i++) {
        text += "🔴 ";
      }
    }
    if (isAnswerFound) {
      text += "🟢 ";
    }
    return text;
  };

  return (
    <div className="App">
      <h3 className="maintitle pt-2">Isaithulir</h3>
      <h6 style={{ color: "white" }}>
        Guess the tamil song - <b>{formatDate}</b>{" "}
      </h6>
      <div class="player">
        <div class="cover">
          {(isAnswerFound || chances===0)? (
            <img src={imageUrl} height={"50px"} width={"50px"} />
          ) : (
            <i
              className="fa fa-question fa-5x"
              style={{ color: "gray", paddingTop: "20px" }}
              aria-hidden="true"
            ></i>
          )}
          {displayMessage && (
            <p style={{ fontColor: "red", color: "#f07560" }}>
              {displayMessage}
            </p>
          )}
        </div>
        <div class="info">
          {!isAnswerFound ? (
            chances <= 4 ? (
              <div>
                <div
                  className="textinfo"
                  style={{ display: "flex", marginLeft: "40px" }}
                >
                  <h4>Guess </h4>
                  <i
                    class="fa fa-info-circle"
                    aria-hidden="true"
                    style={{
                      cursor: "pointer",
                      color: "sandybrown",
                      paddingLeft: "5px",
                      paddingTop: "7px",
                    }}
                    onClick={handleShow}
                  ></i>
                </div>

                <p>Click to Play audio for {endTime / 1000} seconds</p>
              </div>
            ) : (
              <div class="title">Wrong Choice </div>
            )
          ) : (
            <div>
              <h5>{answer}</h5>
              <p style={{ color: "green" }}>You Guessed Correct</p>
            </div>
          )}
        </div>
        <div class="music-box">
          <ReactAudioPlayer
            src={todaysSong.url}
            ref={bref}
            onPlay={() => onclickPlay()}
          />
          <i
            class={`fa ${
              isPlaying ? "fa-play-circle" : "fa-pause-circle"
            } fa-4x format`}
            style={{
              color: "sandybrown",
              cursor: "pointer",
              marginBottom: "10px",
            }}
            aria-hidden="true"
            onClick={onclickPlayButton}
          ></i>
          {chances > 0 && !isAnswerFound ? (
            <div className="autocomplete">
              <input
                type="text"
                value={value}
                ref={inputRef}
                placeholder="Start guessing.."
                onChange={(e) => handleChange(e)}
                onKeyDown={(e) => handleChange(e)}
              />
              {suggestionsActive && <Suggestions />}
              <button
                className="btn btn-primary mt-2 format "
                style={{
                  backgroundColor: "sandybrown",
                  borderColor: "sandybrown",
                }}
                onClick={() => value && onclicksubmit()}
              >
                Submit
              </button>
              &nbsp;&nbsp;
              <button
                className="btn btn-primary mt-2 format"
                style={{
                  backgroundColor: "#ed5f4a",
                  borderColor: "#ed5f4a",
                }}
                onClick={() => onClickSkip()}
              >
                Skip(+3s)
              </button>
            </div>
          ) : (
            !isAnswerFound && (
              <div>
                <p style={{ color: "red" }}> Wrong guesses</p>
                <p> Answer is "{answer}"</p>
              </div>
            )
          )}
          {(isAnswerFound || chances === 0) && (
            <div>
              <button
                className="btn btn-success mt-2 format"
                style={{
                  backgroundColor: "green",
                  borderColor: "green",
                }}
                onClick={() => onclickShare()}
              >
                {!copied && (
                  <i
                    class="fa fa-share-alt"
                    style={{ marginRight: "4px" }}
                    aria-hidden="true"
                  ></i>
                )}
                {!copied ? "Share" : "Copied"}
              </button>
            </div>
          )}
          {(isAnswerFound || chances === 0) && (
            <>
              <Countdown />
            </>
          )}{" "}
          <div style={{marginTop: '40px'}}>
          <i class="fa fa-calendar" aria-hidden="true">
            {" "}
            Try Archives
          </i>
          <DatePicker
            selected={tdate}
            dateFormat="dd/MM/yyyy"
            filterDate={(e) => e < new Date() && e > new Date("2022-07-03")}
            onChange={(date) => onChangeDate(date)}
            customInput={<ExampleCustomInput />}
          />
          {(isAnswerFound || chances === 0) &&
          <div><p style={{marginBottom: '2px', fontFamily:'Arial, Helvetica, sans-serif',marginTop:'12px'}}> ❤️ Isaithulir?</p>
          <Button style={{backgroundColor:'#219c1a', color: 'white', borderColor:'#219c1a' , paddingTop:0 }} onClick={ () => window.open('https://coindrop.to/isaithulir', '_blank')}><i class="fa fa-usd" aria-hidden="true"></i> Tip</Button></div>
          }
          </div>
          <Modal show={show} onHide={handleClose}>
            <Modal.Header
              closeButton
              style={{ backgroundColor: "#fce9d6", height: "50px" }}
            >
              <Modal.Title>Instructions</Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ backgroundColor: "#fce9d6" }}>
              <p>
                1. Play the audio for 3 seconds and guess the song from
                suggestion.
              </p>
              <p>
                2. If guessed wrongly , audio will be increased by 3 seconds.
              </p>
              <p>3. Complete guessing within 4 choices and share your score.</p>
            </Modal.Body>
          </Modal>
        </div>
      </div>
    </div>
  );
}
