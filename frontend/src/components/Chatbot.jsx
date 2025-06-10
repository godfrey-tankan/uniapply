// src/components/Chatbot.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Bot, MessageSquareText, Send, X, Loader2 } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getUserProfile } from '@/services/userService';
import {
    fetchInstitutions,
    fetchInstitutionPrograms,
    fetchAllProgramDetails,
    fetchPublicProgramDetails,
    fetchProgramRecommendations, // This should now map to /api/programs/recommendations/for-user/
    fetchProgramsByInstitutionName,
    fetchProgramStats,
    fetchPlatformStats,
    fetchUserApplications,
    fetchUserActivities,
    checkUserApplication
} from '@/services/dataService';

import './Chatbot.css';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

console.log('--- Chatbot Component Load ---');
console.log('Gemini API Key:', GEMINI_API_KEY ? 'Loaded' : 'NOT LOADED');
if (!GEMINI_API_KEY) {
    console.error('ERROR: Gemini API Key is missing! Chatbot will not function.');
}
console.log('--- End Chatbot Component Load ---');

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const tools = [
    {
        functionDeclarations: [
            {
                name: 'getUserProfileData',
                description: 'Gets the current authenticated user\'s profile data, including personal details like name, email, gender, province, country, A-level points, O-level subjects. Use this to automatically retrieve user information for program recommendations or to answer questions about the user\'s profile. Returns fields like `id`, `username`, `email`, `full_name`, `a_level_points`, `olevel_subjects`, `gender`, `province`, `country`.',
                parameters: { type: 'object', properties: {} },
            },
            {
                name: 'listInstitutions',
                description: 'Retrieves a list of all available educational institutions (universities, colleges). Use this when the user asks about available institutions or universities. Returns a list of objects with `id`, `name`, `location`.',
                parameters: { type: 'object', properties: {} },
            },
            {
                name: 'getInstitutionPrograms',
                description: 'Fetches all academic programs offered by a specific institution using its ID. Use this when the user asks what programs a particular university offers and provides an institution ID. Returns a list of program objects with `id`, `name`, `code`, `description`.',
                parameters: {
                    type: 'object',
                    properties: {
                        institution_id: { type: 'integer', description: 'The ID of the institution whose programs are to be retrieved.' },
                    },
                    required: ['institution_id'],
                },
            },
            {
                name: 'getProgramsByInstitutionName',
                description: 'Fetches academic programs offered by a specific institution using its name. Use this when the user asks what programs a particular university offers by name (e.g., "programs at University of Zimbabwe"). Returns a list of program objects with `id`, `name`, `code`, `institution_name`, `department_name`.',
                parameters: {
                    type: 'object',
                    properties: {
                        institution_name: { type: 'string', description: 'The name or a part of the name of the institution whose programs are to be retrieved.' },
                    },
                    required: ['institution_name'],
                },
            },
            {
                name: 'getAllProgramDetails',
                description: 'Retrieves details for all publicly available academic programs. Use this when the user asks about all programs or wants to browse programs without specifying criteria. Returns a list of program objects with `id`, `name`, `code`, `description`, `institution_name`, `faculty_name`, `department_name`, `min_points_required`, `requirements`.',
                parameters: { type: 'object', properties: {} },
            },
            {
                name: 'getPublicProgramDetailsById',
                description: 'Fetches detailed information for a specific public academic program using its primary key (ID). Use this when the user asks for details about a specific program by its ID. Returns program details including `id`, `name`, `code`, `description`, `institution`, `department`, `min_points_required`, and `requirements`.',
                parameters: {
                    type: 'object',
                    properties: {
                        pk: { type: 'integer', description: 'The primary key (ID) of the program to retrieve details for.' },
                    },
                    required: ['pk'],
                },
            },
            {
                name: 'getProgramRecommendations',
                description: 'Recommends academic programs based on the user\'s profile data (A-level points, O-level subjects, gender, province, and country). This tool automatically uses the user\'s profile data. If the user\'s profile is incomplete, it will use the available information. Returns a list of recommended program objects with `program_id`, `program_name`, `institution`, `min_points_required`, `student_points`, `acceptance_probability`, and `required_subjects`.',
                parameters: {
                    type: 'object',
                    properties: {
                        points: { type: 'integer', description: 'User\'s A-level points, if explicitly provided in the current query.' },
                        interest: { type: 'string', description: 'The user\'s expressed academic interest (e.g., "tech", "medicine", "arts").' },
                    },
                }, // No parameters needed, relies on profile data
            },
            {
                name: 'getProgramStats',
                description: 'Retrieves comprehensive statistics for a specific academic program by its ID, including acceptance rate, average applicant points, current applications, application trends, and demographics (gender, regions). Use this when the user asks for statistics, trends, or demographics about a specific program.',
                parameters: {
                    type: 'object',
                    properties: {
                        pk: { type: 'integer', description: 'The primary key (ID) of the program to retrieve statistics for.' },
                    },
                    required: ['pk'],
                },
            },
            {
                name: 'getPlatformStats',
                description: 'Retrieves overall platform enrollment statistics, including most popular programs, total applicants, applicant growth, total number of programs and universities, average application processing time, and the next application deadline. Use this when the user asks for general platform statistics or insights.',
                parameters: { type: 'object', properties: {} },
            },
            {
                name: 'getUserApplications',
                description: 'Retrieves a list of all applications submitted by the current authenticated user. Returns application details including `id`, `program_name`, `institution_name`, `status`, `date_applied`.',
                parameters: { type: 'object', properties: {} },
            },
            {
                name: 'getUserActivities',
                description: 'Retrieves a log of recent activities performed by the current authenticated user on the platform, such as application creations, updates, or status changes. Returns a list of activity objects with `action`, `description`, `timestamp`.',
                parameters: { type: 'object', properties: {} },
            },
            {
                name: 'checkIfUserAppliedToProgram',
                description: 'Checks if the current authenticated user has already submitted an application for a specific program. Returns `true` or `false` for `has_applied` and the `status` of the application if it exists.',
                parameters: {
                    type: 'object',
                    properties: {
                        program_id: { type: 'integer', description: 'The ID of the program to check the application status for.' },
                    },
                    required: ['program_id'],
                },
            },
        ],
    },
];

const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    tools: tools,
    systemInstruction: `You are UniApply Assistant. Your main goal is to help students navigate university applications and find relevant academic information.
        1.  **Prioritize Tool Usage:** Always try to answer questions using the provided tools before resorting to general knowledge.
        2.  **Be Precise and Comprehensive:** When using tools, extract all relevant information from the tool's response to provide a detailed answer.
        3.  **Clarify Ambiguity:** If a user's request is ambiguous, ask for clarification.
        4.  **Automatic Profile Data:** For program recommendations, automatically use the user's profile data retrieved by the \`getUserProfileData\` tool. Do not ask the user for their information. If the profile is incomplete, use the available data.
        5.  **Acknowledge Errors:** If a tool call fails, inform the user about the error and suggest rephrasing or providing more details. Do not apologize excessively.
        6.  **Summarize and Format Data Clearly:** When presenting lists (institutions, programs, applications, recommendations, statistics), provide a concise summary and **always use bullet points or numbered lists for readability**. Highlight key information (e.g., program name, institution, points required, acceptance probability) using bolding. Offer to provide more details upon request.
        7.  **Guidance on Applications:** If a user asks about their applications, confirm that you can access their applications and then use the \`getUserApplications\` tool. If they ask about applying to a specific program, you can use \`checkIfUserAppliedToProgram\`.
        8.  **Proactive Information:** If appropriate, suggest relevant information that might be helpful based on their query.
        9.  **Format Responses Clearly:** Use bullet points, bolding, or other formatting to make responses easy to read.
        10. **Example Interactions:**
            * User: "What universities are there?" -> Use \`listInstitutions\`.
            * User: "Tell me about Bachelor of Science in Computer Science." -> If they provide an ID, use \`getPublicProgramDetailsById\`. If not, ask for an ID or suggest finding it.
            * User: "Recommend programs for me." -> Use \`getUserProfileData\` to get user profile data. Then call \`getProgramRecommendations\`.
            * User: "What are the stats for program ID 123?" -> Use \`getProgramStats\`.
            * User: "How many students applied last year?" -> Use \`getPlatformStats\`.
            * User: "What applications have I submitted?" -> Use \`getUserApplications\`.
            * User: "What activities have I performed?" -> Use \`getUserActivities\`.
            * User: "Have I applied to program ID 456?" -> Use \`checkIfUserAppliedToProgram\`.
        11. ** Data Presentation:** When presenting data, use clear formatting:
        - **Institutions:** List with names and locations.
        - **Programs:** List with names, codes, and institutions.
        - **Applications:** List with program names, institutions, and statuses.
        - **Recommendations:** List with program names, institutions, and acceptance probabilities.
        - **Statistics:** Use bullet points for key stats, e.g., "Total Applicants: 5000", "Most Popular Program: Computer Science".
        12. **Error Handling:** If a tool call fails, provide a clear error message and suggest rephrasing or providing more details. Do not apologize excessively.
        13. **User Engagement:** Keep the conversation engaging and helpful. If the user seems stuck, offer to help them find information or clarify their request.
        14. **Avoid Overloading with Information:** If the user asks for too much information, summarize key points and offer to provide more details if needed.
        `

});

// Helper function to convert Markdown to JSX
const renderMarkdown = (markdownText) => {
    let htmlText = markdownText.replace(/</g, '&lt;').replace(/>/g, '&gt;');

    // Bold: **text**
    htmlText = htmlText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Italic: *text*
    htmlText = htmlText.replace(/\*(.*?)\*/g, '<em>$1</em>');
    // Code: `code`
    htmlText = htmlText.replace(/`(.*?)`/g, '<code>$1</code>');
    // New lines
    htmlText = htmlText.replace(/\n/g, '<br />');

    // Bullet points (simple approach for common cases)
    const lines = htmlText.split('<br />');
    let inList = false;
    let processedLines = [];

    lines.forEach(line => {
        if (line.startsWith('- ') || line.startsWith('&bull; ') || line.match(/^\d+\.\s/)) {
            if (!inList) {
                processedLines.push('<ul>');
                inList = true;
            }
            let listItemContent = line;
            if (line.startsWith('- ')) {
                listItemContent = line.substring(2);
            } else if (line.startsWith('&bull; ')) {
                listItemContent = line.substring(7);
            } else if (line.match(/^\d+\.\s/)) {
                listItemContent = line.replace(/^\d+\.\s/, '');
            }
            processedLines.push(`<li>${listItemContent}</li>`);
        } else {
            if (inList) {
                processedLines.push('</ul>');
                inList = false;
            }
            processedLines.push(line);
        }
    });

    if (inList) {
        processedLines.push('</ul>');
    }

    let finalHtml = processedLines.join('');
    finalHtml = finalHtml.replace(/<br \/><br \/>/g, '<br />');

    return <div dangerouslySetInnerHTML={{ __html: finalHtml }} />;
};


const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [showAnimation, setShowAnimation] = useState(false);
    const messagesEndRef = useRef(null);

    const executeToolCall = async (call) => {
        console.log(`Executing tool: ${call.name} with args:`, call.args);

        try {
            let result;

            switch (call.name) {
                case 'getUserProfileData':
                    result = await getUserProfile();
                    break;
                case 'listInstitutions':
                    result = await fetchInstitutions();
                    break;
                case 'getInstitutionPrograms':
                    result = await fetchInstitutionPrograms(call.args.institution_id);
                    break;
                case 'getProgramsByInstitutionName':
                    result = await fetchProgramsByInstitutionName(call.args.institution_name);
                    break;
                case 'getAllProgramDetails':
                    result = await fetchAllProgramDetails();
                    break;
                case 'getPublicProgramDetailsById':
                    result = await fetchPublicProgramDetails(call.args.pk);
                    break;
                case 'getProgramRecommendations':
                    result = await fetchProgramRecommendations(call.args);
                    break;
                case 'getProgramStats':
                    result = await fetchProgramStats(call.args.pk);
                    break;
                case 'getPlatformStats':
                    result = await fetchPlatformStats();
                    break;
                case 'getUserApplications':
                    result = await fetchUserApplications();
                    break;
                case 'getUserActivities':
                    result = await fetchUserActivities();
                    break;
                case 'checkIfUserAppliedToProgram':
                    result = await checkUserApplication(call.args.program_id);
                    break;
                default:
                    throw new Error(`Unknown function call: ${call.name}`);
            }

            console.log(`Tool ${call.name} returned:`, result);
            return result;

        } catch (error) {
            console.error(`Error in executeToolCall for ${call.name}:`, error);
            throw error;
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        const animationTimer = setTimeout(() => {
            setShowAnimation(true);
            const hideAnimationTimer = setTimeout(() => {
                setShowAnimation(false);
            }, 3000);
            return () => clearTimeout(hideAnimationTimer);
        }, 500);

        return () => clearTimeout(animationTimer);
    }, []);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (input.trim() === '') return;

        const userMessage = { text: input, sender: 'user' };
        setMessages((prevMessages) => [...prevMessages, userMessage]);
        setInput('');
        setIsTyping(true);

        try {
            const chat = model.startChat({
                history: messages.map(msg => ({
                    role: msg.sender === 'user' ? 'user' : 'model',
                    parts: [{ text: msg.text }],
                })),
            });

            const result = await chat.sendMessage(input);
            const response = result.response;
            const functionCalls = response.functionCalls();

            if (functionCalls && functionCalls.length > 0) {

                const functionResults = [];

                for (const call of functionCalls) {
                    try {

                        let toolResponseData;

                        toolResponseData = await executeToolCall(call);

                        const formattedResponse = {
                            success: true,
                            data: toolResponseData,
                            message: `Retrieved ${Array.isArray(toolResponseData) ? toolResponseData.length : 1} item(s)`
                        };

                        functionResults.push({
                            name: call.name,
                            response: formattedResponse
                        });

                    } catch (toolError) {

                        functionResults.push({
                            name: call.name,
                            response: {
                                success: false,
                                error: toolError.message || 'Tool execution failed',
                                message: `Failed to execute ${call.name}`
                            }
                        });
                    }
                }

                try {

                    const functionResponseParts = functionResults.map(result => ({
                        functionResponse: {
                            name: result.name,
                            response: result.response
                        }
                    }));

                    const toolResponseResult = await chat.sendMessage(functionResponseParts);
                    const aiResponse = toolResponseResult.response;

                    setMessages((prevMessages) => [...prevMessages, {
                        text: aiResponse.text(),
                        sender: 'ai'
                    }]);

                } catch (geminiError) {

                    let fallbackMessage = 'I encountered an issue processing the information, but here\'s what I found:\n\n';

                    functionResults.forEach(result => {
                        if (result.response.success) {
                            const data = result.response.data;

                            switch (result.name) {
                                case 'getUserProfileData':
                                    if (data) {
                                        fallbackMessage += `**Your Profile:**\n`;
                                        fallbackMessage += `- Name: ${data.full_name || 'Not specified'}\n`;
                                        fallbackMessage += `- A-Level Points: ${data.a_level_points || 'Not specified'}\n`;
                                        fallbackMessage += `- Province: ${data.province || 'Not specified'}\n`;
                                        fallbackMessage += `- Country: ${data.country || 'Not specified'}\n\n`;
                                    }
                                    break;

                                case 'getUserApplications':
                                    if (Array.isArray(data) && data.length > 0) {
                                        fallbackMessage += `**Your Applications (${data.length}):**\n`;
                                        data.slice(0, 3).forEach(app => {
                                            fallbackMessage += `- ${app.program_name} at ${app.institution_name} (Status: ${app.status})\n`;
                                        });
                                        if (data.length > 3) {
                                            fallbackMessage += `- ... and ${data.length - 3} more\n`;
                                        }

                                        const sortedApps = data.sort((a, b) => new Date(b.date_applied) - new Date(a.date_applied));
                                        if (sortedApps.length > 0) {
                                            fallbackMessage += `\n**Most Recent Application:** ${sortedApps[0].program_name} on ${new Date(sortedApps[0].date_applied).toLocaleDateString()}\n\n`;
                                        }
                                    } else {
                                        fallbackMessage += `**Your Applications:** No applications found.\n\n`;
                                    }
                                    break;

                                case 'listInstitutions':
                                    if (Array.isArray(data)) {
                                        fallbackMessage += `**Available Institutions (${data.length}):**\n`;
                                        data.slice(0, 5).forEach(inst => {
                                            fallbackMessage += `- ${inst.name} (${inst.location || 'Location not specified'})\n`;
                                        });
                                        if (data.length > 5) {
                                            fallbackMessage += `- ... and ${data.length - 5} more\n`;
                                        }
                                        fallbackMessage += '\n';
                                    }
                                    break;
                                case 'getProgramRecommendations':
                                    if (Array.isArray(data) && data.length > 0) {
                                        fallbackMessage += `**Recommended Programs for You (${data.length}):**\n`;
                                        data.slice(0, 5).forEach(prog => {
                                            fallbackMessage += `- ${prog.program_name} (${prog.institution}) - Est. Acceptance: ${(prog.acceptance_probability * 100).toFixed(0)}%\n`;
                                        });
                                        if (data.length > 5) {
                                            fallbackMessage += `- ... and ${data.length - 5} more\n`;
                                        }
                                        fallbackMessage += '\n';
                                    } else {
                                        fallbackMessage += `**Program Recommendations:** Could not generate recommendations at this time. This could be because your profile is incomplete, or no suitable programs were found.\n\n`;
                                    }
                                    break;
                                case 'getPublicProgramDetailsById':
                                    if (data) {
                                        fallbackMessage += `**Program Details: ${data.name}**\n`;
                                        fallbackMessage += `- Code: ${data.code}\n`;
                                        fallbackMessage += `- Institution: ${data.institution_name}\n`;
                                        fallbackMessage += `- Min. Points: ${data.min_points_required}\n`;
                                        fallbackMessage += `- Required Subjects: ${data.requirements || 'N/A'}\n\n`;
                                    }
                                    break;
                                case 'getProgramsByInstitutionName':
                                    if (Array.isArray(data) && data.length > 0) {
                                        fallbackMessage += `**Programs at ${data[0].institution_name || 'specified institution'} (${data.length}):**\n`;
                                        data.slice(0, 5).forEach(prog => {
                                            fallbackMessage += `- ${prog.name} (ID: ${prog.id})\n`;
                                        });
                                        if (data.length > 5) {
                                            fallbackMessage += `- ... and ${data.length - 5} more\n`;
                                        }
                                        fallbackMessage += '\n';
                                    } else {
                                        fallbackMessage += `**Programs:** No programs found for this institution.\n\n`;
                                    }
                                    break;
                                default:
                                    if (Array.isArray(data)) {
                                        fallbackMessage += `**${result.name}:** Found ${data.length} items\n\n`;
                                    } else if (data) {
                                        fallbackMessage += `**${result.name}:** Data retrieved successfully\n\n`;
                                    }
                            }
                        } else {
                            fallbackMessage += `**Error:** ${result.response.message}\n\n`;
                        }
                    });

                    setMessages((prevMessages) => [...prevMessages, {
                        text: fallbackMessage,
                        sender: 'ai'
                    }]);
                }

            } else {
                // No function calls, just regular response
                setMessages((prevMessages) => [...prevMessages, {
                    text: response.text(),
                    sender: 'ai'
                }]);
            }

        } catch (error) {
            console.error('Error in handleSendMessage:', error);

            if (error.status === 400 && error.errorDetails &&
                error.errorDetails.some(detail => detail.reason === 'API_KEY_INVALID')) {
                setMessages((prevMessages) => [...prevMessages, {
                    text: 'API key is invalid or not set up correctly. Please check console for details.',
                    sender: 'ai'
                }]);
            } else {
                setMessages((prevMessages) => [...prevMessages, {
                    text: 'Sorry, I am having trouble connecting right now. Please try again later.',
                    sender: 'ai'
                }]);
            }
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <>
            {/* Floating button */}
            <button
                className={`floating-btn bg-teal text-white p-4 rounded-full shadow-lg hover:bg-teal-dark focus:outline-none focus:ring-2 focus:ring-teal-light focus:ring-offset-2 transition-all duration-300 transform hover:scale-110 ${showAnimation ? 'animate-pulse-once' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
                aria-label={isOpen ? "Close chatbot" : "Open chatbot"}
            >
                {isOpen ? <X size={24} /> : <MessageSquareText size={24} />}
            </button>

            {/* Chat window */}
            {isOpen && (
                <div className="mb-8 chatbot-container bg-white rounded-lg shadow-xl border border-gray-200 flex flex-col overflow-hidden">
                    {/* Header */}
                    <div className="bg-teal-500  text-white p-4 rounded-t-lg flex items-center justify-between shadow-md">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <Bot size={30} /> UniApply Assistant
                        </h3>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-white hover:text-gray-200"
                            aria-label="Close chat"
                        >
                            <X size={40} />
                        </button>
                    </div>

                    {/* Messages display */}
                    <div className="flex-1 p-4 overflow-y-auto custom-scrollbar">
                        {messages.length === 0 && (
                            <div className="text-center text-gray-500 mt-10">
                                Hi there! How can I help you today?
                            </div>
                        )}
                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                className={`flex mb-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'
                                    }`}
                            >
                                <div
                                    className={`max-w-[75%] p-3 rounded-lg shadow-sm ${msg.sender === 'user'
                                        ? 'bg-teal-500 text-white rounded-br-none'
                                        : 'bg-gray-100 text-gray-800 rounded-bl-none'
                                        }`}
                                    style={{ whiteSpace: 'pre-line' }}
                                >
                                    {renderMarkdown(msg.text)}
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div className="flex justify-start mb-3">
                                <div className="max-w-[75%] p-3 rounded-lg shadow-sm bg-gray-100 text-gray-800 rounded-bl-none">
                                    <Loader2 className="h-5 w-5 animate-spin inline-block mr-2" />
                                    Thinking...
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input area */}
                    <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 bg-gray-50 flex items-center gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type your message..."
                            className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400"
                            disabled={isTyping}
                        />
                        <button
                            type="submit"
                            className="bg-teal text-white p-3 rounded-lg hover:bg-teal-dark focus:outline-none focus:ring-2 focus:ring-teal-light focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isTyping || input.trim() === ''}
                            aria-label="Send message"
                        >
                            <Send size={20} />
                        </button>
                    </form>
                </div>
            )}
        </>
    );
};

export default Chatbot;