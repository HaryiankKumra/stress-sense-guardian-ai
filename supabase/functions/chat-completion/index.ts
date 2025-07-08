import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ChatRequest {
  message: string;
  userId?: string;
  sessionId?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      {
        status: 405,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request body
    const { message, userId, sessionId }: ChatRequest = await req.json();

    if (!message) {
      return new Response(
        JSON.stringify({ error: "Message is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Store user message if userId provided
    if (userId && sessionId) {
      await supabase
        .from("chat_history")
        .insert({
          user_id: userId,
          session_id: sessionId,
          message_type: "user",
          content: message,
          metadata: {}
        });
    }

    // Generate a simple response (you can replace this with OpenAI API call)
    let response = "I'm here to help you with stress management. ";
    
    if (message.toLowerCase().includes("stress")) {
      response += "It sounds like you're dealing with stress. Here are some techniques that might help: deep breathing, meditation, or taking a short walk. Would you like me to guide you through a breathing exercise?";
    } else if (message.toLowerCase().includes("anxious") || message.toLowerCase().includes("anxiety")) {
      response += "Anxiety is very common. Try the 5-4-3-2-1 grounding technique: notice 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, and 1 you can taste.";
    } else if (message.toLowerCase().includes("sleep") || message.toLowerCase().includes("tired")) {
      response += "Good sleep is crucial for stress management. Try to maintain a regular sleep schedule, avoid screens before bed, and create a relaxing bedtime routine.";
    } else {
      response += "Could you tell me more about what's troubling you? I'm here to provide support and stress management techniques.";
    }

    // Store assistant response if userId provided
    if (userId && sessionId) {
      await supabase
        .from("chat_history")
        .insert({
          user_id: userId,
          session_id: sessionId,
          message_type: "assistant",
          content: response,
          metadata: {}
        });
    }

    return new Response(
      JSON.stringify({ 
        response,
        success: true
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error) {
    console.error("Error in chat-completion function:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);