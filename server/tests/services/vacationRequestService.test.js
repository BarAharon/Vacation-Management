import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../src/models/userModel.js", () => ({
  userModel: {
    findById: vi.fn(),
  },
}));

vi.mock("../../src/models/vacationRequestModel.js", () => ({
  vacationRequestModel: {
    create: vi.fn(),
    findByUserId: vi.fn(),
    findAll: vi.fn(),
    findById: vi.fn(),
    updateStatus: vi.fn(),
  },
}));

import { vacationRequestService } from "../../src/services/vacationRequestService.js";
import { userModel } from "../../src/models/userModel.js";
import { vacationRequestModel } from "../../src/models/vacationRequestModel.js";

const mockRequester = { id: 1, name: "Alice Johnson", role: "Requester" };
const mockValidator = { id: 2, name: "David Manager", role: "Validator" };
const mockPendingRequest = { id: 10, status: "Pending", user: mockRequester };
const mockApprovedRequest = { id: 11, status: "Approved", user: mockRequester };

beforeEach(() => vi.clearAllMocks());

// ---------------------------------------------------------------------------
describe("vacationRequestService.submitRequest", () => {
  it("creates a request for a valid Requester", async () => {
    userModel.findById.mockResolvedValue(mockRequester);
    vacationRequestModel.create.mockResolvedValue({ id: 1, status: "Pending" });

    const result = await vacationRequestService.submitRequest({
      userId: 1,
      start_date: "2025-08-01",
      end_date: "2025-08-10",
      reason: "Summer break",
    });

    expect(vacationRequestModel.create).toHaveBeenCalledWith(
      expect.objectContaining({ start_date: "2025-08-01", end_date: "2025-08-10", status: "Pending" })
    );
    expect(result.status).toBe("Pending");
  });

  it("throws 404 when the user does not exist", async () => {
    userModel.findById.mockResolvedValue(null);

    await expect(
      vacationRequestService.submitRequest({ userId: 999, start_date: "2025-08-01", end_date: "2025-08-10" })
    ).rejects.toMatchObject({ status: 404, message: "User not found" });
  });

  it("throws 403 when the user is a Validator", async () => {
    userModel.findById.mockResolvedValue(mockValidator);

    await expect(
      vacationRequestService.submitRequest({ userId: 2, start_date: "2025-08-01", end_date: "2025-08-10" })
    ).rejects.toMatchObject({ status: 403 });
  });

  it("throws 400 when end_date is before start_date", async () => {
    userModel.findById.mockResolvedValue(mockRequester);

    await expect(
      vacationRequestService.submitRequest({ userId: 1, start_date: "2025-08-10", end_date: "2025-08-01" })
    ).rejects.toMatchObject({ status: 400, message: "end_date must be after start_date" });
  });

  it("sets reason to null when not provided", async () => {
    userModel.findById.mockResolvedValue(mockRequester);
    vacationRequestModel.create.mockResolvedValue({ id: 2, status: "Pending" });

    await vacationRequestService.submitRequest({ userId: 1, start_date: "2025-08-01", end_date: "2025-08-05" });

    expect(vacationRequestModel.create).toHaveBeenCalledWith(
      expect.objectContaining({ reason: null })
    );
  });
});

// ---------------------------------------------------------------------------
describe("vacationRequestService.getAllRequests", () => {
  it("returns all requests when no filter is given", async () => {
    vacationRequestModel.findAll.mockResolvedValue([mockPendingRequest, mockApprovedRequest]);

    const result = await vacationRequestService.getAllRequests();

    expect(vacationRequestModel.findAll).toHaveBeenCalledWith(undefined);
    expect(result).toHaveLength(2);
  });

  it("passes valid status filter to the model", async () => {
    vacationRequestModel.findAll.mockResolvedValue([mockPendingRequest]);

    await vacationRequestService.getAllRequests("Pending");

    expect(vacationRequestModel.findAll).toHaveBeenCalledWith("Pending");
  });

  it("throws 400 for an invalid status value", async () => {
    await expect(vacationRequestService.getAllRequests("Unknown")).rejects.toMatchObject({
      status: 400,
    });
  });
});

// ---------------------------------------------------------------------------
describe("vacationRequestService.approveRequest", () => {
  it("approves a Pending request and returns the updated record", async () => {
    vacationRequestModel.findById
      .mockResolvedValueOnce(mockPendingRequest)
      .mockResolvedValueOnce({ ...mockPendingRequest, status: "Approved" });
    vacationRequestModel.updateStatus.mockResolvedValue({});

    const result = await vacationRequestService.approveRequest(10);

    expect(vacationRequestModel.updateStatus).toHaveBeenCalledWith(10, "Approved", null);
    expect(result.status).toBe("Approved");
  });

  it("throws 404 when the request does not exist", async () => {
    vacationRequestModel.findById.mockResolvedValue(null);

    await expect(vacationRequestService.approveRequest(999)).rejects.toMatchObject({ status: 404 });
  });

  it("throws 400 when the request is already Approved", async () => {
    vacationRequestModel.findById.mockResolvedValue(mockApprovedRequest);

    await expect(vacationRequestService.approveRequest(11)).rejects.toMatchObject({ status: 400 });
  });
});

// ---------------------------------------------------------------------------
describe("vacationRequestService.rejectRequest", () => {
  it("rejects a Pending request with a comment", async () => {
    vacationRequestModel.findById
      .mockResolvedValueOnce(mockPendingRequest)
      .mockResolvedValueOnce({ ...mockPendingRequest, status: "Rejected", comments: "Too many absences" });
    vacationRequestModel.updateStatus.mockResolvedValue({});

    const result = await vacationRequestService.rejectRequest(10, "Too many absences");

    expect(vacationRequestModel.updateStatus).toHaveBeenCalledWith(10, "Rejected", "Too many absences");
    expect(result.status).toBe("Rejected");
  });

  it("throws 400 when comments are missing", async () => {
    await expect(vacationRequestService.rejectRequest(10, "")).rejects.toMatchObject({
      status: 400,
      message: "comments are required when rejecting a request",
    });
  });

  it("throws 400 when comments are only whitespace", async () => {
    await expect(vacationRequestService.rejectRequest(10, "   ")).rejects.toMatchObject({ status: 400 });
  });

  it("throws 404 when the request does not exist", async () => {
    vacationRequestModel.findById.mockResolvedValue(null);

    await expect(vacationRequestService.rejectRequest(999, "some reason")).rejects.toMatchObject({ status: 404 });
  });

  it("throws 400 when the request is already Rejected", async () => {
    vacationRequestModel.findById.mockResolvedValue({ ...mockPendingRequest, status: "Rejected" });

    await expect(vacationRequestService.rejectRequest(10, "some reason")).rejects.toMatchObject({ status: 400 });
  });
});
