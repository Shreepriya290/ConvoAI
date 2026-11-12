import "dotenv/config";

const MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-120b";

const getOpenAIAPIResponse = async (messages) => {
    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
        },
        body: JSON.stringify({
            model: MODEL,
            messages: messages.map(m => ({ role: m.role, content: m.content }))
        })
    };

    try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", options);
        const data = await response.json();

        if (!data.choices || !data.choices[0]) {
            console.log("Unexpected Groq response:", data);
            return "Sorry, I couldn't process that.";
        }

        return data.choices[0].message.content;
    } catch (err) {
        console.log(err);
        return "Sorry, something went wrong.";
    }
};

export default getOpenAIAPIResponse;
