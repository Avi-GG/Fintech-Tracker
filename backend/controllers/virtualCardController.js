import prisma from "../prisma/prismaClient.js";

const generateCardNumber = () => {
  return Array.from({ length: 16 }, () => Math.floor(Math.random() * 10)).join("");
};

const generateCvv = () => {
  return Array.from({ length: 3 }, () => Math.floor(Math.random() * 10)).join("");
};

const getExpiryDate = () => {
  const date = new Date();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = String(date.getFullYear() + 5).slice(-2);
  return `${month}/${year}`;
};

export const createVirtualCard = async (req, res) => {
  const userId = req.user.id;
  try {
    const wallet = await prisma.wallet.findUnique({ where: { userId } });
    if (!wallet) {
      return res.status(404).json({ error: "Wallet not found" });
    }

    const virtualCard = await prisma.virtualCard.create({
      data: {
        cardNumber: generateCardNumber(),
        expiryDate: getExpiryDate(),
        cvv: generateCvv(),
        walletId: wallet.id,
      },
    });

    res.json(virtualCard);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create virtual card" });
  }
};

export const getVirtualCards = async (req, res) => {
  const userId = req.user.id;
  try {
    const wallet = await prisma.wallet.findUnique({ where: { userId } });
    if (!wallet) {
      return res.status(404).json({ error: "Wallet not found" });
    }

    const virtualCards = await prisma.virtualCard.findMany({
      where: { walletId: wallet.id },
    });

    res.json(virtualCards);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to get virtual cards" });
  }
};
