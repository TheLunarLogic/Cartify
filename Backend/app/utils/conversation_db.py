from app.utils.db import get_mongo
from langchain_core.messages import BaseMessage
from typing import List, Optional
from datetime import datetime
import json

class ConversationDB:
    """Database operations for conversation management."""
    
    def __init__(self):
        self.mongo = get_mongo()
        self.collection = self.mongo.db.conversations if self.mongo else None
    
    def get_conversation(self, user_id: str, thread_id: str) -> Optional[dict]:
        """Get a conversation by user_id and thread_id."""
        if not self.collection:
            return None
        return self.collection.find_one({
            'user_id': user_id,
            'thread_id': thread_id
        })
    
    def create_conversation(self, user_id: str, thread_id: str) -> bool:
        """Create a new conversation."""
        if not self.collection:
            return False
        try:
            self.collection.insert_one({
                'user_id': user_id,
                'thread_id': thread_id,
                'created_at': datetime.utcnow(),
                'updated_at': datetime.utcnow(),
                'messages': []
            })
            return True
        except Exception:
            return False
    
    def get_messages(self, user_id: str, thread_id: str) -> List[BaseMessage]:
        """Get all messages for a conversation."""
        if not self.collection:
            return []
        
        conversation = self.get_conversation(user_id, thread_id)
        if not conversation:
            return []
        
        messages = []
        for msg_data in conversation.get('messages', []):
            try:
                # Reconstruct message from stored data
                if msg_data['type'] == 'human':
                    from langchain_core.messages import HumanMessage
                    messages.append(HumanMessage(content=msg_data['content']))
                elif msg_data['type'] == 'ai':
                    from langchain_core.messages import AIMessage
                    messages.append(AIMessage(content=msg_data['content']))
            except Exception:
                continue
        
        return messages
    
    def add_message(self, user_id: str, thread_id: str, message: BaseMessage) -> bool:
        """Add a message to a conversation."""
        if not self.collection:
            return False
        
        try:
            message_data = {
                'type': 'human' if message.__class__.__name__ == 'HumanMessage' else 'ai',
                'content': message.content,
                'timestamp': datetime.utcnow()
            }
            
            self.collection.update_one(
                {'user_id': user_id, 'thread_id': thread_id},
                {
                    '$push': {'messages': message_data},
                    '$set': {'updated_at': datetime.utcnow()}
                }
            )
            return True
        except Exception:
            return False
    
    def get_user_threads(self, user_id: str) -> List[str]:
        """Get all thread IDs for a user."""
        if not self.collection:
            return []
        
        conversations = self.collection.find(
            {'user_id': user_id},
            {'thread_id': 1, '_id': 0}
        ).sort('updated_at', -1)
        
        return [conv['thread_id'] for conv in conversations]
    
    def delete_conversation(self, user_id: str, thread_id: str) -> bool:
        """Delete a specific conversation."""
        if not self.collection:
            return False
        
        try:
            result = self.collection.delete_one({
                'user_id': user_id,
                'thread_id': thread_id
            })
            return result.deleted_count > 0
        except Exception:
            return False
    
    def delete_all_user_conversations(self, user_id: str) -> int:
        """Delete all conversations for a user."""
        if not self.collection:
            return 0
        
        try:
            result = self.collection.delete_many({'user_id': user_id})
            return result.deleted_count
        except Exception:
            return 0
    
    def get_conversation_summary(self, user_id: str) -> List[dict]:
        """Get a summary of all conversations for a user."""
        if not self.collection:
            return []
        
        conversations = self.collection.find(
            {'user_id': user_id},
            {'thread_id': 1, 'created_at': 1, 'updated_at': 1, 'messages': 1}
        ).sort('updated_at', -1)
        
        summaries = []
        for conv in conversations:
            message_count = len(conv.get('messages', []))
            summaries.append({
                'thread_id': conv['thread_id'],
                'created_at': conv['created_at'],
                'updated_at': conv['updated_at'],
                'message_count': message_count
            })
        
        return summaries

# Global instance
_conversation_db = None

def get_conversation_db() -> ConversationDB:
    """Get the global conversation database instance."""
    global _conversation_db
    if _conversation_db is None:
        _conversation_db = ConversationDB()
    return _conversation_db
