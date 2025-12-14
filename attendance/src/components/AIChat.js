// src/components/AIChat.js

import React, { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRobot, faPaperPlane, faXmark, faCommentDots } from '@fortawesome/free-solid-svg-icons';
import { chatWithAI } from '../pages/api/networking' // Import hàm API vừa tạo

const AIChat = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([
        { role: 'ai', text: 'Xin chào Admin! Tôi có thể giúp gì về dữ liệu điểm danh hôm nay?' }
    ]);

    // Ref để tự động cuộn xuống tin nhắn mới nhất
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userQuestion = input;
        
        // 1. Hiển thị câu hỏi của User ngay lập tức
        setMessages(prev => [...prev, { role: 'user', text: userQuestion }]);
        setInput('');
        setIsLoading(true);

        // 2. Gọi API Backend
        const answer = await chatWithAI(userQuestion);

        // 3. Hiển thị câu trả lời của AI
        setMessages(prev => [...prev, { role: 'ai', text: answer }]);
        setIsLoading(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleSend();
    };

    return (
        <div style={{ position: 'fixed', bottom: '30px', right: '30px', zIndex: 9999, fontFamily: 'sans-serif' }}>
            
            {/* NÚT MỞ CHAT (Nổi bật) */}
            {!isOpen && (
                <button 
                    onClick={() => setIsOpen(true)}
                    style={{
                        width: '65px', height: '65px', borderRadius: '50%',
                        background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                        color: 'white', border: 'none', cursor: 'pointer',
                        boxShadow: '0 4px 20px rgba(111, 76, 255, 0.4)',
                        fontSize: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'transform 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                    <FontAwesomeIcon icon={faCommentDots} />
                </button>
            )}

            {/* CỬA SỔ CHAT */}
            {isOpen && (
                <div style={{
                    width: '380px', height: '550px', background: '#1e293b',
                    borderRadius: '20px', boxShadow: '0 10px 50px rgba(0,0,0,0.5)',
                    display: 'flex', flexDirection: 'column', overflow: 'hidden',
                    border: '1px solid #334155', animation: 'fadeIn 0.3s ease-in-out'
                }}>
                    {/* Header */}
                    <div style={{
                        padding: '20px', background: 'linear-gradient(90deg, #1e293b, #0f172a)',
                        borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between',
                        alignItems: 'center', color: 'white'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '10px', height: '10px', background: '#22c55e', borderRadius: '50%' }}></div>
                            <span style={{ fontWeight: 'bold', fontSize: '16px' }}>Trợ lý Phân tích AI</span>
                        </div>
                        <button 
                            onClick={() => setIsOpen(false)}
                            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '20px' }}
                        >
                            <FontAwesomeIcon icon={faXmark} />
                        </button>
                    </div>

                    {/* Nội dung Chat */}
                    <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '15px', backgroundColor: '#0f172a' }}>
                        {messages.map((msg, index) => (
                            <div key={index} style={{
                                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                maxWidth: '80%',
                            }}>
                                <div style={{
                                    padding: '12px 16px',
                                    borderRadius: msg.role === 'user' ? '15px 15px 0 15px' : '15px 15px 15px 0',
                                    background: msg.role === 'user' ? '#3b82f6' : '#334155',
                                    color: msg.role === 'user' ? 'white' : '#e2e8f0',
                                    fontSize: '14px', lineHeight: '1.5', boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                                }}>
                                    {msg.role === 'ai' && <FontAwesomeIcon icon={faRobot} style={{marginRight: '8px', color: '#a855f7'}} />}
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div style={{ alignSelf: 'flex-start', color: '#94a3b8', fontSize: '13px', marginLeft: '10px' }}>
                                <FontAwesomeIcon icon={faRobot} spin style={{marginRight:'5px'}}/> AI đang suy nghĩ...
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Footer Input */}
                    <div style={{ padding: '15px', background: '#1e293b', borderTop: '1px solid #334155', display: 'flex', gap: '10px' }}>
                        <input 
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Hỏi về số liệu, danh sách..."
                            style={{
                                flex: 1, padding: '12px', borderRadius: '10px',
                                border: '1px solid #475569', background: '#0f172a',
                                color: 'white', outline: 'none', fontSize: '14px'
                            }}
                        />
                        <button 
                            onClick={handleSend} 
                            disabled={isLoading}
                            style={{
                                background: '#3b82f6', color: 'white', border: 'none',
                                borderRadius: '10px', padding: '0 20px', cursor: 'pointer',
                                transition: 'background 0.2s', opacity: isLoading ? 0.7 : 1
                            }}
                        >
                            <FontAwesomeIcon icon={faPaperPlane} />
                        </button>
                    </div>
                </div>
            )}
            
            {/* Animation */}
            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default AIChat;