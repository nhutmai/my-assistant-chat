import { Client } from "@notionhq/client";

export class NotionService {
  private notion: Client;
  private databaseId: string;

  constructor() {
    const apiKey = process.env.NOTION_API_KEY;
    this.databaseId = process.env.NOTION_DATABASE_ID || "";

    console.log("apiKey", apiKey);
    console.log("databaseId", this.databaseId);

    if (!apiKey) {
      console.warn("NOTION_API_KEY is not defined. Notion logging will be disabled.");
    }

    this.notion = new Client({ auth: apiKey });
  }

  async saveLog(prompt: string, data: any) {
    if (!this.databaseId) return;

    try {
      await this.notion.pages.create({
        parent: { database_id: this.databaseId },
        properties: {
          Prompt: {
            title: [
              {
                text: { content: prompt },
              },
            ],
          },
          Category: {
            select: {
              name: data.category || "unknown",
            },
          },
          Title: {
            rich_text: [
              {
                text: { content: data.title || "Untitled" },
              },
            ],
          },
          Value: {
            number: data.value || 0,
          },
          Date: {
            rich_text: [
              {
                text: { content: data.date || new Date().toISOString() },
              },
            ],
          },
        },
      });
    } catch (error) {
      console.error("Notion Save Error:", error);
    }
  }

  async getLogs() {
    if (!this.databaseId) return [];

    try {
      const response = await this.notion.databases.query({
        database_id: this.databaseId,
        sorts: [
          {
            timestamp: "created_time",
            direction: "descending",
          },
        ],
        page_size: 20,
      });
      return response.results;
    } catch (error) {
      console.error("Notion Query Error:", error);
      return [];
    }
  }
}

export const notionService = new NotionService();
