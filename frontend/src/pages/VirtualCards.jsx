import { useState, useEffect } from "react";
import axios from "../api/axiosInstance";

const VirtualCards = () => {
  const [cards, setCards] = useState([]);
  const [message, setMessage] = useState("");

  const fetchCards = async () => {
    try {
      const res = await axios.get("/api/virtual-cards");
      setCards(res.data);
    } catch (err) {
      setMessage(err.response?.data?.error || "Failed to fetch cards");
    }
  };

  useEffect(() => {
    fetchCards();
  }, []);

  const handleCreateCard = async () => {
    try {
      await axios.post("/api/virtual-cards");
      fetchCards();
    } catch (err) {
      setMessage(err.response?.data?.error || "Failed to create card");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Virtual Cards</h1>
      <button
        onClick={handleCreateCard}
        className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
      >
        Create New Card
      </button>
      {message && <p className="mb-4 text-red-500">{message}</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card) => (
          <div key={card.id} className="p-4 bg-gray-100 rounded shadow">
            <p>Card Number: {card.cardNumber}</p>
            <p>Expiry Date: {card.expiryDate}</p>
            <p>CVV: {card.cvv}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VirtualCards;
