import { VercelRequest, VercelResponse } from "@vercel/node";

module.exports = (req: VercelRequest, res: VercelResponse) => {
  console.log(req.url, req.headers);
  res.status(404).json({message: 'Not Found'});
}
