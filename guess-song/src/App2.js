import "./styles.scss";
import ReactAudioPlayer from "react-audio-player";
import axios from "axios";
import React, { useRef, useState, useEffect, forwardRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import querystring from "query-string";
import Countdown from "./Countdown";
import { Button, Navbar, Nav, Container, Card, Modal, Row , Col} from "react-bootstrap";
import CardHeader from "react-bootstrap/esm/CardHeader";

var Buffer = require("buffer").Buffer;

export default function App2() {
    const [tdate, setTdate] = useState(new Date());
    const [songList, setSongList] = useState({});
    const offset = tdate.getTimezoneOffset();
    const offsetDate = new Date(tdate.getTime() - offset * 60 * 1000);
    const formatDate = offsetDate.toISOString().split("T")[0];
    const ExampleCustomInput = forwardRef(({ value, onClick }, ref) => (
        <i class="fa fa-calendar fa-2x" style={{ color: 'white', cursor: 'pointer', marginRight: '15px' }} aria-hidden="true"
            onClick={onClick}
            ref={ref}
        ></i>
    ));
    const todaysSong = songList[formatDate] || {};
    let showno = JSON.stringify(todaysSong) === '{}';
    const [showNoshow, setShowNoShow ] = useState(showno)
    const [suggestions, setSuggestions] = useState([]);
    const [suggestionIndex, setSuggestionIndex] = useState(0);
    const [suggestionsActive, setSuggestionsActive] = useState(false);
    const [value, setValue] = useState("");
    const [chances, setChances] = useState(4);
    const [displayMessage, setDisplayMessage] = useState("");
    const [endTime, setEndTime] = useState(3000);
    const [loading, setLoading] = useState(true);
    const [isloading, setisLoading] = useState(true);

    const [isPlaying, setIsPlaying] = useState(true);
    const {picture: imageUrl}  = todaysSong;
    const bref = useRef();
    const [shareMessage, setShareMessage] = useState("");
    const [show, setShow] = useState(false);
    const [showSupport, setShowSupport] = useState(false);
    const [copied, setCopied] = useState(false);
    const [isAnswerFound, setIsAnswerFound] = useState(false);
    const [guesses, setGuesses] = useState([]);
    const [showStats, setShowStats] = useState(false);
    const [stats, setStats] = useState({});

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
        setGuesses([])
        setLoading(true)
    };

    useEffect(() => {
        if (localStorage.getItem(formatDate) === "true") {
            setIsAnswerFound(true);
            setEndTime(15000);
        } else {
            localStorage.setItem(formatDate, false);
        }
        calculateStats()
    }, [isAnswerFound, loading]);

    useEffect(() => {
        getData()
    },[])

    const getData = async () => {
        setisLoading(true);
        var config = {
            method: 'get',
            url: "https://santhosh2514.github.io/tamilsongs/db.json",
        };

        axios(config)
            .then(function (response) {
                setSongList(response.data)
                const ofs = new Date().getTimezoneOffset();
                const ofsd = new Date(new Date().getTime() - ofs * 60 * 1000);
                const fd = ofsd.toISOString().split("T")[0];
                let ts = JSON.stringify(response.data[fd]) === undefined
                setShowNoShow(ts)
                setisLoading(false);
            })
            .catch(function (error) {
                console.log(error);
            });
    }

    const inputRef = useRef(null);
    const client_id = process.env.REACT_APP_CLIENT_ID;
    const client_secret = process.env.REACT_APP_CLIENT_SECRET;
    const answer = todaysSong.answer || "";
    const headers = {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization:
            "Bearer BQCHqbGTk_ZD8g8FeP1Qh98zebnm0_yn0lW7o6j9t3DX7wzJbwJFi9FdClsvUX8NffqcqzNgkadtIbR5f0A9Uxd70t7rGkPXx7cgiw45Mhokh33FcWFMxN9qKUWjWYO1kGdlBJk9kRkaFmQ8p_Chj0R0TnzxcX38wjRu1DtnD-mJQ4xqCb6giEOAWc07Vmrrdp2XEaNzucODmWjVQ",
    };

    const calculateStats = () => {
        const startDate = new Date("2022-07-05");
        const endDate = new Date();
        let loop = new Date(startDate)
        let played = 0, currentStreak = 0, maxStreak = 0, won = 0;
        while (loop <= endDate) {
            const offset = loop.getTimezoneOffset();
            const offsetDate = new Date(loop.getTime() - offset * 60 * 1000);
            const formatDate = offsetDate.toISOString().split("T")[0];
            if(localStorage.getItem(formatDate) !== null){
                played += 1
                if (localStorage.getItem(formatDate) === 'true') {
                    won +=1
                    currentStreak += 1
                    if (currentStreak > maxStreak) {
                        maxStreak = currentStreak
                    }
                }else{
                    currentStreak = 0
                }
            }
            var newDate = loop.setDate(loop.getDate() + 1);
            loop = new Date(newDate);
        }
        setStats({
            played,
            won,
            currentStreak,
            maxStreak
        })
    }

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
                if (["single", "compilation", "album"].includes(data[each].album.album_type)) {
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
        const guess = guesses;
        if (value.toLowerCase().includes(answer.toLowerCase()) 
        || ((formatDate === '2022-08-15') && (value.toLowerCase().includes("andha arabi kadaloram".toLowerCase()))) ||
        ((formatDate === '2022-08-18') && (value.toLowerCase().includes("unnakaagathane inthauriyrullathu".toLowerCase())) ||
        ((formatDate === '2022-08-19') && (value.toLowerCase().includes("sambho".toLowerCase()))) ||
        ((formatDate === '2022-08-22') && (value.toLowerCase().includes("kaadhal mazhaiye".toLowerCase()))) ||
        ((formatDate === '2022-09-14') && (value.toLowerCase().includes("paakathe enna paakathe".toLowerCase()))) || 
        ((formatDate === '2022-09-19') && (value.toLowerCase().includes("kadal vandal".toLowerCase())))
         )) {
            setDisplayMessage("Correct answer");
            setIsAnswerFound(true);
            setEndTime(25000);
            localStorage.setItem(formatDate, true);
            guess.push('🟢 '+ value.toLowerCase())
        } else {
            setChances(newChn);
            setValue(null);
            inputRef.current.value = "";
            setEndTime(endTime + 3000);
            setDisplayMessage(`${newChn} chances left`);
            guess.push('🔴 '+ value.toLowerCase())
        }
        setGuesses(guess)
    };
    const onClickSkip = () => {
        const guess = guesses;
        const newChn = chances - 1;
        setChances(newChn);
        setValue(null);
        inputRef.current.value = "";
        setEndTime(endTime + 3000);
        if(newChn === 0){
            setEndTime(30000)
        }
        guess.push('🔴 '+ 'Skipped')
        setGuesses(guess)
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
            title: `Isaithulir - ${formatDate}`,
            text: `Isaithulir - ${isAnswerFound ? 5 - chances : 4
                }/4\n  ${getSharetext()} \n #isaithulir \n`,
            url: "https://isaithulir.herokuapp.com/",
        };
        if (navigator.share) {
            navigator.share(shareContent).then(() => { });
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

    const toTitleCase = (str) => {
        return str.replace(
          /\w\S*/g,
          function(txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
          }
        );
      }

     const hideNoShow = () => {
        setShowNoShow(false)
     }

    return (
        <div className="App">
            <Navbar style={{ backgroundColor: 'black' }}>
                <Container className="justify-content-center" style={{ flex: 1, backgroundColor:'black' }} >
                    <div style={{ marginRight: '3em', backgroundColor: 'green', padding: '6px', borderRadius: '2%' }} >
                        <h2 style={{ color: "white", display: "inline-block", fontFamily: 'courier', fontSize: '20px', marginRight: '10px' }}>ISAITHULIR </h2>
                        <i class="fa fa-music" style={{ color: 'white', display: "inline-block" }} aria-hidden="true"></i>
                    </div>
                    <i class="fa fa-bar-chart fa-2x" style={{ color: 'white', marginRight: '15px', cursor: 'pointer' }} aria-hidden="true" onClick={() => setShowStats(!showStats)}></i>
                    <i class="fa fa-question-circle fa-2x" style={{ color: 'white', marginRight: '15px', cursor: 'pointer' }} aria-hidden="true" onClick={handleShow}></i>
                    <DatePicker
                        selected={tdate}
                        dateFormat="dd/MM/yyyy"
                        filterDate={(e) => e < new Date() && e > new Date("2022-07-03")}
                        onChange={(date) => onChangeDate(date)}
                        customInput={<ExampleCustomInput />}
                    />
                </Container>
            </Navbar>
            {!isloading && <Container>
                <Card style={{ width: '23em', left: '50%', transform: "translate(-50%, 0%)", height: '54em', backgroundColor: '#121212' }}>
                    <Card style={{borderColor:'#323232'}}>
                        <CardHeader style={{ backgroundColor: 'black' , borderColor: 'black'}}> Guess tamil song : {formatDate}</CardHeader>
                        <div class="cover">
                            {(isAnswerFound || chances === 0) ? (
                                <img src={imageUrl} height={"50px"} width={"50px"} />
                            ) : (
                                <i
                                    className="fa fa-question fa-5x"
                                    style={{ color: "#1ed760", paddingTop: "20px" }}
                                    aria-hidden="true"
                                ></i>
                            )}
                            {displayMessage && (
                                <p style={{ fontColor: "red", color: "#f07560" }}>
                                    {displayMessage}
                                </p>
                            )}
                        </div>
                        <div className="info">
                            {!isAnswerFound ? (
                                chances <= 4 ? (
                                    <div>
                                        <div
                                            className="textinfo"
                                            style={{ display: "flex", marginLeft: "55px", marginTop:"10px", }}
                                        >
                                            <h4>Guess </h4>
                                        </div>
                                        <p >Click to Play audio for {endTime / 1000} seconds</p>
                                    </div>
                                ) : (
                                    <div class="title">Wrong Choice </div>
                                )
                            ) : (
                                <div>
                                    <h5>{toTitleCase(answer)}</h5>
                                    <p style={{ color: "#1ed760", fontSize:'17px' }}>You Guessed Correct</p>
                                </div>
                            )}
                        </div>
                        <div className="music-box mt-3">
                            <ReactAudioPlayer
                                src={todaysSong.url}
                                ref={bref}
                                onLoadedMetadata={() => setLoading(false)}
                                onPlay={() => onclickPlay()}
                            />
                            <i
                                class={loading ? 'fa fa-spinner fa-spin fa-4x' : `fa ${isPlaying ? "fa-play-circle" : "fa-pause-circle"
                                    } fa-4x format`}
                                style={{
                                    color: "#1ed760",
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
                                        style={{borderRadius:'10px'}}
                                        placeholder={"Start guessing.."}
                                        onChange={(e) => handleChange(e)}
                                        onKeyDown={(e) => handleChange(e)}
                                    />
                                    {suggestionsActive && <Suggestions />}
                                    <button
                                        className="btn btn-primary mt-3 format "
                                        style={{
                                            backgroundColor: "#1ed760",
                                            borderColor: "#1ed760",
                                        }}
                                        onClick={() => value && onclicksubmit()}
                                    >
                                        Submit
                                    </button>
                                    &nbsp;&nbsp;
                                    <button
                                        className="btn btn-primary mt-3 format"
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
                            <div style={{marginTop:'15px', color: 'white'}}>
                            {guesses.map((each) => {
                                return (
                                    <input  type={'text'} style={{color:'white',borderRadius:'6px'}}disabled value={each}/>
                                )
                            })}
                            </div>
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
                                    <p style={{ marginBottom: '2px', fontFamily: 'Arial, Helvetica, sans-serif', marginTop: '12px' }}> ❤️ Isaithulir ?,</p>
                                    <a href="https://coindrop.to/isaithulir" style={{ color: "#b5522b" }} target="_blank">Buy me a coffee</a>
                                </>
                            )}
                        </div>

                    </Card>
                </Card>
            </Container>}
            <Modal show={showNoshow} onHide={hideNoShow}>
                <Modal.Header
                    closeButton
                    style={{ backgroundColor: "black", color:'white',height: "50px" }}
                >
                    <Modal.Title>Important Note</Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ backgroundColor: "black", color:'white' }}>
                    <p>
                        No new song added for today. If you have missed playing for any old dates, click on calendar icon at the top to play for old dates.
                    </p>
                    <p>
                        P.S - Isaithulir is no longer maintained actively by the developer. Thanks for playing till now.
                    </p>
                </Modal.Body>
            </Modal>
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
            <Modal show={showStats} onHide={() => setShowStats(!showStats)} size="sm">
                <Modal.Header
                    closeButton
                    style={{ backgroundColor: "black", color:'white',height: "50px" }}
                >
                    <Modal.Title>Stats</Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ backgroundColor: "black" ,color: 'white', fontSize:'20px', fontFamily: 'sans-serif', fontWeight: 'bold'}}>
                    <Row>
                    <Col md={8}>
                        <p>Played</p>
                    </Col>
                    <Col>
                        <p>{stats.played}</p>    
                    </Col>
                    </Row>
                    <Row>
                    <Col md={8}>
                        <p>Won</p>
                    </Col>
                    <Col>
                        <p>{stats.won}</p>    
                    </Col>
                    </Row>
                    <Row>
                    <Col md={8}>
                        <p>Win %</p>
                    </Col>
                    <Col>
                        <p>{parseFloat((stats.won / stats.played)* 100).toFixed(2)}</p>    
                    </Col>
                    </Row>
                    <Row>
                    <Col md={8}>
                        <p>Current Streak</p>
                    </Col>
                    <Col>
                        <p>{stats.currentStreak}</p>    
                    </Col>
                    </Row>
                    <Row>
                    <Col md={8}>
                        <p>Max Streak</p>
                    </Col>
                    <Col>
                        <p>{stats.maxStreak}</p>    
                    </Col>
                    </Row>
                </Modal.Body>
            </Modal>
        </div>

    );
}
