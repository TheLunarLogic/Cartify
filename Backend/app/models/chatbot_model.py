try:
    from langchain_core.messages import BaseMessage, HumanMessage, AIMessage
    from langchain_google_genai import ChatGoogleGenerativeAI
    LANGCHAIN_AVAILABLE = True
except ImportError:
    LANGCHAIN_AVAILABLE = False
    BaseMessage = object
    HumanMessage = object
    AIMessage = object

from app.config.settings import GOOGLE_API_KEY
from app.utils.conversation_db import get_conversation_db
from typing import List, Optional
import uuid

# Initialize the LLM
if LANGCHAIN_AVAILABLE and GOOGLE_API_KEY:
    try:
        llm = ChatGoogleGenerativeAI(
            api_key=GOOGLE_API_KEY,
            model='gemini-2.5-flash'
        )
    except Exception:
        llm = None
else:
    llm = None

def get_chatbot_response(message: str, user_id: str, thread_id: Optional[str] = None) -> str:
    """
    Get a response from the chatbot for a given message.
    
    Args:
        message: The user's message
        user_id: The user's ID
        thread_id: Optional thread ID for conversation continuity
        
    Returns:
        The chatbot's response
    """
    # Generate thread_id if not provided
    if thread_id is None:
        thread_id = str(uuid.uuid4())
    
    # Get conversation database
    db = get_conversation_db()
    
    # Get or create conversation
    conversation = db.get_conversation(user_id, thread_id)
    if not conversation:
        db.create_conversation(user_id, thread_id)
    
    # Get existing messages
    messages = db.get_messages(user_id, thread_id)
    
    # Add human message
    if LANGCHAIN_AVAILABLE:
        human_message = HumanMessage(content=message)
        db.add_message(user_id, thread_id, human_message)
        messages.append(human_message)
    else:
        # Fallback for when langchain is not available
        db.add_message(user_id, thread_id, {'type': 'human', 'content': message})
        messages.append({'type': 'human', 'content': message})
    
    try:
        if not LANGCHAIN_AVAILABLE or llm is None:
            return "AI chatbot is not available. Please install required dependencies."
        
        # Get AI response
        ai_response = llm.invoke(messages)
        response_content = ai_response.content
        
        # Add AI message to conversation
        ai_message = AIMessage(content=response_content)
        db.add_message(user_id, thread_id, ai_message)
        
        return response_content
        
    except Exception as e:
        error_message = f"I'm sorry, I encountered an error: {str(e)}"
        if LANGCHAIN_AVAILABLE:
            ai_message = AIMessage(content=error_message)
            db.add_message(user_id, thread_id, ai_message)
        return error_message

def get_user_threads(user_id: str) -> List[str]:
    """Get all thread IDs for a user."""
    return get_conversation_db().get_user_threads(user_id)

def get_conversation_history(user_id: str, thread_id: str) -> List[BaseMessage]:
    """Get conversation history for a specific thread."""
    return get_conversation_db().get_messages(user_id, thread_id)

def delete_conversation(user_id: str, thread_id: str) -> bool:
    """Delete a specific conversation thread."""
    return get_conversation_db().delete_conversation(user_id, thread_id)

def delete_all_user_conversations(user_id: str) -> int:
    """Delete all conversations for a user."""
    return get_conversation_db().delete_all_user_conversations(user_id)

def get_conversation_summary(user_id: str) -> List[dict]:
    """Get a summary of all conversations for a user."""
    return get_conversation_db().get_conversation_summary(user_id)
