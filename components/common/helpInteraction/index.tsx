"use client";

import { JSX, useState } from "react";
import {
  Headphones,
  X,
  Mail,
  MessageCircle,
  Phone,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { HelpIcon } from "@/public/icons/icons";

export const HelpInteraction = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [ticketOption, setTicketOption] = useState(false);

  return (
    <div className="fixed bottom-3 right-3 z-990 hidden md:flex items-start md:items-center justify-center px-4 py-4">
      <div className="flex items-center justify-center relative">
        <motion.button
          onClick={() => setIsOpen(true)}
          layoutId="help-button"
          className="flex items-center gap-2 px-3 py-3 bg-white border shadow-sm hover:gap-3 transition-[gap]"
          style={{
            borderRadius: 40,
          }}
        >
          <motion.div
            layoutId="headphones"
            className="flex items-center justify-center"
          >
            <HelpIcon className="size-6 text-gray-600" />
          </motion.div>
          {/* <motion.span
            layoutId="need-help"
            className="text-gray-700 font-medium block mt-0.5"
          >
            ¿Necesitas ayda?u
          </motion.span> */}
        </motion.button>

        <AnimatePresence>
          {isOpen && (
            <div className="absolute bottom-0 right-3 flex items-center justify-center">
              <motion.div
                layoutId="help-button"
                className="w-[440px] bg-white shadow-sm p-6 border"
                style={{
                  borderRadius: 30,
                }}
              >
                <div className="flex justify-between items-center mb-4">
                  <motion.h2
                    // layoutId="need-help"
                    className="text-xl font-semibold text-gray-800"
                  >
                    ¿Necesitas ayuda?
                  </motion.h2>
                  <motion.button
                    layoutId="headphones"
                    onClick={() => {
                      setIsOpen(false);
                      setTicketOption(false);
                    }}
                    className="p-1 rounded-full hover:bg-gray-100"
                  >
                    <X className="size-5 text-gray-500" />
                  </motion.button>
                </div>

                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                  className="text-gray-600 mb-6"
                >
                  Estamos aquí para ayudarte 24/7. Elige tu método de contacto
                  preferido a continuación.
                </motion.p>

                <div className="space-y-3">
                  {contactOptions.map((option, index) => (
                    <motion.div
                      key={option.id}
                      className="flex items-center gap-3 w-full justify-between py-4 px-3 rounded-2xl bg-gray-50/50 hover:bg-gray-50 border border-gray-100 cursor-pointer"
                      initial={{ opacity: 0, y: 10, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.9 }}
                      transition={{ duration: 0.3, delay: index * 0.1 + 0.3 }}
                      onClick={() => {
                        if (option.id === 1) {
                          setIsOpen(false);
                          setTicketOption(true);
                        }
                      }}
                    >
                      <div className="p-3 bg-white rounded-full border">
                        {option.icon}
                      </div>
                      <div className="w-full flex flex-col items-start">
                        <motion.div
                          layoutId={`text-${option.id}`}
                          className="font-medium text-gray-800"
                        >
                          {option.title}
                        </motion.div>
                        <div className="text-sm text-gray-500">
                          {option.description}
                        </div>
                      </div>
                      <motion.div
                        layoutId={`return-${option.id}`}
                        className="flex items-center"
                      >
                        <ChevronRight className="size-6 text-gray-400" />
                      </motion.div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {ticketOption && (
            <div className="absolute bottom-0 right-3 flex items-center justify-center">
              <motion.div
                layoutId="help-button"
                className="w-[440px] bg-white shadow-sm p-6 border"
                style={{
                  borderRadius: 30,
                }}
              >
                <motion.button
                  layoutId="return-1"
                  onClick={() => {
                    setTicketOption(false);
                    setIsOpen(true);
                  }}
                  className="p-1 rounded-full hover:bg-gray-100"
                >
                  <ArrowLeft className="size-5 text-gray-500" />
                </motion.button>
                <motion.h2
                  layoutId={`text-1`}
                  className="text-xl font-semibold text-gray-800 my-4"
                >
                  Abrir un ticket
                </motion.h2>

                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                  className="text-gray-600 mb-6"
                >
                  Normalmente respondemos en un plazo de 24 horas. Por favor,
                  proporciona toda la información posible.
                </motion.p>
                <form className="w-full mx-auto space-y-3">
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.9 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                    className="space-y-2"
                  >
                    <label htmlFor="email" className="block text-gray-500">
                      Correo electrónico
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      className="bg-white w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-gray-300 focus:outline-none"
                      required
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.9 }}
                    transition={{ duration: 0.3, delay: 0.3 }}
                    className="space-y-2"
                  >
                    <label htmlFor="message" className="block text-gray-500">
                      Mensaje
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      className="bg-white w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-gray-300 focus:outline-none min-h-[120px] resize-none"
                      required
                    />
                  </motion.div>

                  <motion.button
                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.9 }}
                    transition={{ duration: 0.3, delay: 0.4 }}
                    type="submit"
                    className="px-8 py-3 bg-black text-white w-full rounded-full font-medium"
                  >
                    Enviar
                  </motion.button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

type ContactOption = {
  id: number;
  icon: JSX.Element;
  title: string;
  description: string;
};

const contactOptions: ContactOption[] = [
  {
    id: 1,
    icon: <Mail className="size-6 text-gray-600" />,
    title: "Abrir un ticket",
    description: "Recibe una respuesta en 24 horas",
  },
  {
    id: 2,
    icon: <MessageCircle className="size-6 text-gray-600" />,
    title: "Chat en vivo",
    description: "Tiempo de espera de 2-3 minutos",
  },
  {
    id: 3,
    icon: <Phone className="size-6 text-gray-600" />,
    title: "Habla con nosotros",
    description: "Recibe una devolucion de llamada",
  },
];
