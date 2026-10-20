"use client";

import { Avatar } from "@/components/ui/avatar";
import { AvatarImage } from "@radix-ui/react-avatar";
import { motion } from "framer-motion";
import { useState } from "react";

const tabs = ["Grupo", "Directo", "Club"] as const;
type Tab = (typeof tabs)[number];

type Message = {
  id: string;
  sender: "incoming" | "outgoing";
  text: string;
  time: string;
  avatar?: string;
};

const conversations: Record<Tab, Message[]> = {
  Grupo: [
    {
      id: "g-1",
      sender: "incoming",
      text: "Opium o Shoko?",
      time: "17:44  ",
      avatar:
        "https://images.unsplash.com/photo-1500917293891-ef795e70e1f6?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      id: "g-2",
      sender: "outgoing",
      text: "Opium, hay lista",
      time: "17:49  ",
    },
    {
      id: "g-3",
      sender: "incoming",
      text: "yo llego sobre 1",
      time: "17:50  ",
      avatar:
        "https://images.unsplash.com/photo-1484515991647-c5760fcecfc7?q=80&w=749&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
  ],
  Directo: [
    {
      id: "d-1",
      sender: "incoming",
      text: "Ya estoy fuera",
      time: "23:11  ",
      avatar:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=800&auto=format&fit=crop",
    },
    {
      id: "d-2",
      sender: "outgoing",
      text: "Bajo ahora",
      time: "23:12  ",
    },
    {
      id: "d-3",
      sender: "incoming",
      text: "Vale, te espero en la entrada",
      time: "23:13  ",
      avatar:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=800&auto=format&fit=crop",
    },
  ],
  Club: [
    {
      id: "c-1",
      sender: "incoming",
      text: "Quién va este sábado?",
      time: "16:30  ",
      avatar:
        "https://images.unsplash.com/photo-1541577141970-eebc83ebe30e?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      id: "c-2",
      sender: "outgoing",
      text: "Yo voy 🔥",
      time: "16:33  ",
    },
    {
      id: "c-3",
      sender: "incoming",
      text: "Lista gratis hasta la 00:30",
      time: "16:35  ",
      avatar:
        "https://discotecasgratis.com/img/uploads/Property/113/PropertyPicture/large/1581550511_65420717_2412706402123827_4937336090987069440_n.jpg",
    },
  ],
};

export const ChatCard = () => {
  const [activeTab, setActiveTab] = useState<Tab>("Grupo");
  const currentConversation = conversations[activeTab];

  return (
    <div className="flex h-full w-full flex-col items-center justify-start space-y-3 pt-0">
      <div className="w-full px-0 pb-1">
        <div className="inline-flex h-[34px] items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] p-1">
          {tabs.map((tab) => {
            const isActive = activeTab === tab;

            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className="relative h-[26px] rounded-full px-3 py-1 text-[11px] font-medium outline-none transition-colors"
              >
                {isActive && (
                  <motion.div
                    layoutId="chat-type-pill"
                    className="absolute inset-0 rounded-full bg-white/90"
                    transition={{
                      type: "spring",
                      stiffness: 380,
                      damping: 30,
                    }}
                  />
                )}
                <span
                  className={`relative z-10 transition-colors ${
                    isActive ? "text-black" : "text-white/55"
                  }`}
                >
                  {tab}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {currentConversation.map((message) => {
        const isIncoming = message.sender === "incoming";

        return (
          <div
            key={`${activeTab}-${message.id}`}
            className={`flex w-full flex-col items-center gap-2.5 ${
              isIncoming ? "justify-start" : "justify-end"
            }`}
          >
            <div
              className={`flex w-full items-center px-0 gap-2 ${
                isIncoming ? "justify-start" : "justify-end"
              }`}
            >
              {isIncoming && message.avatar ? (
                <div className="w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      className="h-full w-full object-cover object-top"
                      src={message.avatar}
                    />
                  </Avatar>
                </div>
              ) : null}

              <motion.div
                className={`relative max-w-[75%] rounded-[18px] border px-4 py-3 ${
                  isIncoming
                    ? "rounded-bl-md border-white/10 bg-[#f2f2f2]"
                    : "cursor-pointer rounded-br-md border-[#8cab8f]/35 bg-[#b8f28a]"
                }`}
                layout
              >
                <span className="text-[15px] font-medium text-[#111]">
                  {message.text}
                </span>
              </motion.div>
            </div>

            <span
              className={`relative flex w-full px-0 text-[10px] text-white/60 ${
                isIncoming
                  ? "items-start justify-start"
                  : "items-end justify-end"
              }`}
            >
              {message.time}
            </span>
          </div>
        );
      })}
    </div>
  );
};
