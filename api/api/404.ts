import { VercelRequest, VercelResponse } from "@vercel/node";

module.exports = (req: VercelRequest, res: VercelResponse) => {
  req;
  res.status(404).json({message: 'Not Found'});
}
