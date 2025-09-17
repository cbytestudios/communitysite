"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { HelpCircle } from "lucide-react"

export default function FAQPage() {
  const faqs = [
    {
      question: "How do I join the game servers?",
      answer: "You can find server connection details on our Servers page. Each server has its IP address and port listed. Simply connect using your game client."
    },
    {
      question: "Do I need to register to play?",
      answer: "Registration is not required to play on our servers, but creating an account gives you access to additional features like Discord integration and community forums."
    },
    {
      question: "How do I reset my password?",
      answer: "You can reset your password by clicking the 'Forgot Password' link on the login page. If you're the site owner, you can use the owner reset feature."
    },
    {
      question: "How do I connect my Discord account?",
      answer: "Once logged in, go to your Profile page and look for the Discord Connection section. Click 'Connect Discord' to link your accounts."
    },
    {
      question: "Are the servers modded?",
      answer: "Server modifications vary by game and server. Check the individual server pages for specific mod information and download links."
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-charcoal via-charcoal-light to-charcoal py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-rye text-amber-gold mb-4">Frequently Asked Questions</h1>
          <p className="text-sage-green/80 max-w-2xl mx-auto">
            Find answers to common questions about our gaming community and services.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="bg-charcoal-light/80 border-amber-gold/20">
            <CardHeader>
              <CardTitle className="text-amber-gold flex items-center">
                <HelpCircle className="w-5 h-5 mr-2" />
                Common Questions
              </CardTitle>
              <CardDescription className="text-sage-green/80">
                Browse through our most frequently asked questions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`} className="border-amber-gold/20">
                    <AccordionTrigger className="text-sage-green hover:text-amber-gold">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-sage-green/80">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}