import { env } from "../../config/env.js";
import logger from "../../utils/logger.js";

// Define the expected shape of the Adjutor API response
interface AdjutorKarmaResponse {
  status: string;
  message: string;
  data?: {
    karma_identity: string;
    amount_in_contention: number;
    reason: string;
    default_date: string;
    [key: string]: any;
  };
  meta?: any;
}

export class AdjutorService {
  static async isBlacklisted(identity: string): Promise<boolean> {
    try {
      const url = `https://adjutor.lendsqr.com/v2/verification/karma/${identity}`;
      
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${env.ADJUTOR_API_KEY}`,
          "Content-Type": "application/json"
        }
      });

      if (response.ok) {
        // HTTP 200: User found in blacklist
        const data = await response.json() as AdjutorKarmaResponse; // Safe cast
        
        logger.warn(`Blacklisted user attempt blocked: ${identity}`, { 
          reason: data.data?.reason,
          amount: data.data?.amount_in_contention
        });
        
        // return true; // TODO: Uncomment in production to actually block
        return false;
      } else if (response.status === 404) {
        return false;
      } else {
        const errorText = await response.text();
        logger.error(`Adjutor API Error [${response.status}]: ${errorText}`);
        return false;
      }
    } catch (error) {
      logger.error("Adjutor Service Connection Error:", error);
      return false;
    }
  }
}