// import { validate }

import { InferType, number, object, validate } from "hyperguard";
import type { NextApiRequest, NextApiResponse } from "next";

const prompt = (
	message: string
) => `Do everything in your power to interpret the message below (tagged with "message:") and respond with the latitude, longitude, and a zoom factor (as used in Google Maps) of a place that the message may have intended. The zoom factor is larger the more specific it is, and smaller the less specific.

It shouldn't matter how nonsensical the message is, respond with your best guess of the latitude and longitude. If it's a perfectly sensical message (such as just the city), then great. Otherwise, do your best.

There is an expectation of just three numbers. Nothing else.

Respond in the following JSON format:

{"latitude": <number>,"longitude": <number>,"zoom": <number>}

message: ${message}`;

import OpenAI from "openai";

const openai = new OpenAI();

const schema = object({
	latitude: number(),
	longitude: number(),
	zoom: number(),
});

async function getLocationInfo(query: string) {
	// Make the API request
	const completion = await openai.chat.completions.create({
		model: "gpt-4o",
		messages: [{ role: "system", content: prompt(query) }],
		// max_tokens: 50, // Adjust the token limit as needed
		// n: 1,
		// stop: null,
		// temperature: 0.0,
	});

	// Extract the response text
	const responseText = completion.choices[0].message.content ?? "";

	try {
		let locationInfo = validate(schema, JSON.parse(responseText));
		return locationInfo;
	} catch (e) {
		try {
			let locationInfo = validate(
				schema,
				JSON.parse(responseText.split("\n").slice(1, -1).join(""))
			);
			return locationInfo;
		} catch (e) {
			console.error(e);
			console.log(responseText);
			throw e;
		}
	}
}

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse<InferType<typeof schema>>
) {
	const { message } = req.body;
	res.status(200).json(await getLocationInfo(message));
}
