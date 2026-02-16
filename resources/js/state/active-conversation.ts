let activeConversationId: string | number | null = null;
let chatViewActive = false;

const conversationListeners = new Set<
    (id: string | number | null) => void
>();
const chatViewListeners = new Set<(isActive: boolean) => void>();

export function setActiveConversation(id: string | number | null) {
    activeConversationId = id;
    conversationListeners.forEach((listener) => listener(activeConversationId));
}

export function getActiveConversation() {
    return activeConversationId;
}

export function subscribeActiveConversation(
    listener: (id: string | number | null) => void,
) {
    conversationListeners.add(listener);
    return () => {
        conversationListeners.delete(listener);
    };
}

export function setChatViewActive(isActive: boolean) {
    chatViewActive = isActive;
    chatViewListeners.forEach((listener) => listener(chatViewActive));
}

export function getIsChatViewActive() {
    return chatViewActive;
}

export function subscribeChatViewActive(listener: (isActive: boolean) => void) {
    chatViewListeners.add(listener);
    return () => {
        chatViewListeners.delete(listener);
    };
}
