/**
 * Generates the default display name for a conversation.
 * Format: "{otherUserName} — {listingTitle}" (title truncated at 30 chars).
 */
const generateDefaultChatName = (
  otherUserName: string,
  listingTitle?: string | null,
): string => {
  if (!listingTitle) return otherUserName;

  const truncatedTitle =
    listingTitle.length > 30
      ? `${listingTitle.slice(0, 30)}...`
      : listingTitle;

  return `${otherUserName} \u2014 ${truncatedTitle}`;
};

export default generateDefaultChatName;
