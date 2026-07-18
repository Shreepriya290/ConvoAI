import "./ChatWindow.css";
import Chat from "./Chat.jsx";
import Modal from "./Modal.jsx";
import { MyContext } from "./MyContext.jsx";
import { API_BASE_URL } from "./config.js";
import { useContext, useState, useEffect, useRef } from "react";
import {ScaleLoader} from "react-spinners";

function ChatWindow() {
    const {prompt, setPrompt, reply, setReply, currThreadId, setCurrThreadId, setPrevChats, setAllThreads, setNewChat, handleLogout, user} = useContext(MyContext);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "dark");
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef(null);

    const [showSettings, setShowSettings] = useState(false);
    const [showUpgrade, setShowUpgrade] = useState(false);

    useEffect(() => {
        document.body.setAttribute("data-theme", theme);
        localStorage.setItem("theme", theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === "dark" ? "light" : "dark");
    };

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            console.log("Speech Recognition not supported in this browser");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = "en-US";

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setPrompt(prev => prev ? prev + " " + transcript : transcript);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.onerror = (event) => {
            console.log("Speech recognition error:", event.error);
            setIsListening(false);
        };

        recognitionRef.current = recognition;
    }, []);

    const toggleListening = () => {
        if (!recognitionRef.current) {
            alert("Voice input isn't supported in this browser. Try Chrome or Edge.");
            return;
        }

        if (isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        } else {
            recognitionRef.current.start();
            setIsListening(true);
        }
    };

    const getReply = async () => {
        setLoading(true);
        setNewChat(false);

        const token = localStorage.getItem("token");

        const options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                message: prompt,
                threadId: currThreadId
            })
        };

        try {
            const response = await fetch(`${API_BASE_URL}/api/chat`, options);
            const res = await response.json();
            setReply(res.reply);
        } catch(err) {
            console.log(err);
        }
        setLoading(false);
    }

    useEffect(() => {
        if(prompt && reply) {
            setPrevChats(prevChats => (
                [...prevChats, {
                    role: "user",
                    content: prompt
                },{
                    role: "assistant",
                    content: reply
                }]
            ));
        }

        setPrompt("");
    }, [reply]);


    const handleProfileClick = () => {
        setIsOpen(!isOpen);
    }

    const handleClearAllThreads = async () => {
        const confirmClear = window.confirm("This will delete all your chat history. Are you sure?");
        if (!confirmClear) return;

        const token = localStorage.getItem("token");
        try {
            await fetch(`${API_BASE_URL}/api/thread`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            setAllThreads([]);
            setPrevChats([]);
            setNewChat(true);
            setShowSettings(false);
        } catch(err) {
            console.log(err);
        }
    };

    return (
        <div className="chatWindow">
            <div className="navbar">
                <span>ConvoAI <i className="fa-solid fa-chevron-down"></i></span>
                <div className="userIconDiv">
                    <span className="themeToggle" onClick={toggleTheme}>
                        {theme === "dark" ? <i className="fa-solid fa-sun"></i> : <i className="fa-solid fa-moon"></i>}
                    </span>
                    <span className="userIcon" onClick={handleProfileClick}><i className="fa-solid fa-user"></i></span>
                </div>
            </div>
            {
                isOpen && 
                <div className="dropDown">
                    <div className="dropDownItem" onClick={() => { setShowSettings(true); setIsOpen(false); }}>
                        <i className="fa-solid fa-gear"></i> Settings
                    </div>
                    <div className="dropDownItem" onClick={() => { setShowUpgrade(true); setIsOpen(false); }}>
                        <i className="fa-solid fa-cloud-arrow-up"></i> Upgrade plan
                    </div>
                    <div className="dropDownItem" onClick={handleLogout}>
                        <i className="fa-solid fa-arrow-right-from-bracket"></i> Log out
                    </div>
                </div>
            }

            {showSettings && (
                <Modal title="Settings" onClose={() => setShowSettings(false)}>
                    <div className="userInfoRow">
                        <span>Name</span>
                        <span>{user?.name}</span>
                    </div>
                    <div className="userInfoRow">
                        <span>Email</span>
                        <span>{user?.email}</span>
                    </div>
                    <button className="dangerButton" onClick={handleClearAllThreads}>
                        Clear all chat history
                    </button>
                </Modal>
            )}

            {showUpgrade && (
                <Modal title="Upgrade Plan" onClose={() => setShowUpgrade(false)}>
                    <p>ConvoAI Pro is on the way — faster responses, more models, and priority support.</p>
                    <span className="comingSoonBadge">🚀 Coming soon</span>
                </Modal>
            )}

            <Chat></Chat>

            <ScaleLoader color="#fff" loading={loading}>
            </ScaleLoader>
            
            <div className="chatInput">
                <div className="inputBox">
                    <input placeholder="Ask anything"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter'? getReply() : ''}
                    >
                    </input>
                    <div id="mic" className={isListening ? "listening" : ""} onClick={toggleListening}>
                        <i className="fa-solid fa-microphone"></i>
                    </div>
                    <div id="submit" onClick={getReply}><i className="fa-solid fa-paper-plane"></i></div>
                </div>
                <p className="info">
                    ConvoAI can make mistakes. Check important info. See Cookie Preferences.
                </p>
            </div>
        </div>
    )
}

export default ChatWindow;