import { useEffect, useState } from "react";
import { getMyVocabulary, deleteVocabularyWord } from "../lib/api";
import { Trash, BookOpen } from "lucide-react";
import toast from "react-hot-toast";

const VocabularyPage = () => {
    const [words, setWords] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadVocabulary();
    }, []);

    const loadVocabulary = async () => {
        try {
            const data = await getMyVocabulary();
            setWords(data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load vocabulary");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteVocabularyWord(id);
            setWords(words.filter(w => w._id !== id));
            toast.success("Word removed");
        } catch (error) {
            toast.error("Failed to delete word");
        }
    };

    if (isLoading) return <div className="p-8 text-center text-zinc-500">Loading your notebook...</div>;

    return (
        <div className="min-h-screen pt-20 px-4 max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
                <div className="p-3 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                     <BookOpen className="size-8 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                   <h1 className="text-3xl font-bold">My Vocabulary Notebook</h1>
                   <p className="text-zinc-500">Words and phrases you saved from your conversations</p>
                </div>
            </div>

            {words.length === 0 ? (
                <div className="text-center py-20 bg-base-200 rounded-xl">
                    <p className="text-xl font-medium text-zinc-500">Your notebook is empty</p>
                    <p className="text-zinc-400 mt-2">Start a chat and save words using the bookmark icon!</p>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {words.map((item) => (
                        <div key={item._id} className="card bg-base-100 shadow-lg border border-base-300">
                            <div className="card-body">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h2 className="card-title text-xl text-emerald-500">{item.word}</h2>
                                        {item.translation && (
                                            <p className="text-zinc-400 italic">"{item.translation}"</p>
                                        )}
                                    </div>
                                    <button onClick={() => handleDelete(item._id)} className="btn btn-ghost btn-sm btn-circle text-red-400">
                                        <Trash size={18} />
                                    </button>
                                </div>
                                {item.originalContext && (
                                    <div className="mt-4 p-3 bg-base-200 rounded-lg text-sm text-zinc-500">
                                        <p className="font-semibold text-xs uppercase mb-1">Context:</p>
                                        "{item.originalContext}"
                                    </div>
                                )}
                                <div className="card-actions justify-end mt-2">
                                    <div className="text-xs text-zinc-500">
                                        {new Date(item.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default VocabularyPage;
