import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the model before importing the service
vi.mock("../../src/models/userModel.js", () => ({
  userModel: {
    findAll: vi.fn(),
    findById: vi.fn(),
  },
}));

import { userService } from "../../src/services/userService.js";
import { userModel } from "../../src/models/userModel.js";

const mockUsers = [
  { id: 1, name: "Alice Johnson", role: "Requester" },
  { id: 2, name: "David Manager", role: "Validator" },
];

beforeEach(() => vi.clearAllMocks());

describe("userService.getAllUsers", () => {
  it("returns all users from the model", async () => {
    userModel.findAll.mockResolvedValue(mockUsers);

    const result = await userService.getAllUsers();

    expect(userModel.findAll).toHaveBeenCalledOnce();
    expect(result).toEqual(mockUsers);
  });
});

describe("userService.getUserById", () => {
  it("returns the user when found", async () => {
    userModel.findById.mockResolvedValue(mockUsers[0]);

    const result = await userService.getUserById(1);

    expect(userModel.findById).toHaveBeenCalledWith(1);
    expect(result).toEqual(mockUsers[0]);
  });

  it("throws 404 when the user does not exist", async () => {
    userModel.findById.mockResolvedValue(null);

    await expect(userService.getUserById(999)).rejects.toMatchObject({
      status: 404,
      message: "User not found",
    });
  });
});
