import { vacationRequestService } from "../services/vacationRequestService.js";

export const vacationRequestController = {
  async submit(req, res, next) {
    try {
      const { userId, start_date, end_date, reason } = req.body;

      if (!userId || !start_date || !end_date) {
        return res.status(400).json({ message: "userId, start_date, and end_date are required" });
      }

      const request = await vacationRequestService.submitRequest({
        userId: Number(userId),
        start_date,
        end_date,
        reason,
      });

      res.status(201).json(request);
    } catch (err) {
      next(err);
    }
  },

  async getByUser(req, res, next) {
    try {
      const requests = await vacationRequestService.getRequestsByUser(Number(req.params.userId));
      res.json(requests);
    } catch (err) {
      next(err);
    }
  },

  async getAll(req, res, next) {
    try {
      const { status } = req.query;
      const requests = await vacationRequestService.getAllRequests(status);
      res.json(requests);
    } catch (err) {
      next(err);
    }
  },

  async approve(req, res, next) {
    try {
      const request = await vacationRequestService.approveRequest(Number(req.params.id));
      res.json(request);
    } catch (err) {
      next(err);
    }
  },

  async reject(req, res, next) {
    try {
      const { comments } = req.body;
      const request = await vacationRequestService.rejectRequest(Number(req.params.id), comments);
      res.json(request);
    } catch (err) {
      next(err);
    }
  },
};
