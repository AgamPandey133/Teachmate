import { useRef, useState } from "react";
import { useChatStore } from "../../store/useChatStore";
import { Image, Send, X, Dices } from "lucide-react";
import toast from "react-hot-toast";
import AudioRecorder from "./AudioRecorder";
import { uploadAudio } from "../../lib/api";
import { conversationStarters } from "../../lib/conversationStarters";

const MessageInput = () => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const { sendMessage } = useChatStore();
  const [isUploading, setIsUploading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview) return;

    try {
      await sendMessage({
        text: text.trim(),
        image: imagePreview,
      });

      // Clear form
      setText("");
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleRecordingComplete = async (audioBlob) => {
      setIsUploading(true);
      try {
        const { audioUrl } = await uploadAudio(audioBlob);
        await sendMessage({ audioUrl });
        toast.success("Voice message sent");
      } catch (error) {
        toast.error("Failed to send voice message");
        console.error(error);
      } finally {
        setIsUploading(false);
      }
  };

  const handleTopicRoulette = async () => {
      const randomTopic = conversationStarters[Math.floor(Math.random() * conversationStarters.length)];
      // Format as bilingual text
      const topicText = `🎲 Topic: ${randomTopic.en}\n🇪🇸 ${randomTopic.es}`;
      
      try {
         await sendMessage({ text: topicText });
      } catch (error) {
         console.error("Failed to send topic", error);
      }
  };

  return (
    <div className="p-4 w-full">
      {imagePreview && (
        <div className="mb-3 flex items-center gap-2">
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-20 h-20 object-cover rounded-lg border border-zinc-700"
            />
            <button
              onClick={removeImage}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300
              flex items-center justify-center"
              type="button"
            >
              <X className="size-3" />
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSendMessage} className="flex items-center gap-2">
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            className="w-full input input-bordered rounded-lg input-sm sm:input-md"
            placeholder="Type a message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageChange}
          />

          <button
            type="button"
            className={`hidden sm:flex btn btn-circle
                     ${imagePreview ? "text-emerald-500" : "text-zinc-400"}`}
            onClick={() => fileInputRef.current?.click()}
          >
            <Image size={20} />
          </button>

          <button
            type="button"
            className="hidden sm:flex btn btn-circle text-zinc-400 hover:text-emerald-500 gap-1"
            onClick={handleTopicRoulette}
            title="Topic Roulette"
          >
            <Dices size={20} />
          </button>
          
           <AudioRecorder onRecordingComplete={handleRecordingComplete} />
        </div>
        <button
          type="submit"
          className="btn btn-sm btn-circle"
          disabled={(!text.trim() && !imagePreview) || isUploading}
        >
          <Send size={22} />
        </button>
      </form>
    </div>
  );
};

export default MessageInput;
