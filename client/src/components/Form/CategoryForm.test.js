import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import CategoryForm from "../../components/Form/CategoryForm";
import "@testing-library/jest-dom";

describe("CategoryForm Component", () => {
  test("renders input field and submit button", () => {
    render(<CategoryForm handleSubmit={() => {}} value="" setValue={() => {}} />);

    // Check if input field is present
    const inputElement = screen.getByPlaceholderText("Enter new category");
    expect(inputElement).toBeInTheDocument();

    // Check if submit button is present
    const submitButton = screen.getByRole("button", { name: /submit/i });
    expect(submitButton).toBeInTheDocument();
  });

  test("allows input value to be changed", () => {
    const setValueMock = jest.fn();
    render(<CategoryForm handleSubmit={() => {}} value="" setValue={setValueMock} />);

    const inputElement = screen.getByPlaceholderText("Enter new category");

    // Simulate user typing
    fireEvent.change(inputElement, { target: { value: "New Category" } });

    // Check if setValueMock was called with correct value
    expect(setValueMock).toHaveBeenCalledWith("New Category");
  });

  test("calls handleSubmit when form is submitted", () => {
    const handleSubmitMock = jest.fn();
    render(<CategoryForm handleSubmit={handleSubmitMock} value="Sample Category" setValue={() => {}} />);

    const formElement = screen.getByTestId("category-form");

    // Simulate form submission
    fireEvent.submit(formElement);

    // Check if handleSubmitMock was called
    expect(handleSubmitMock).toHaveBeenCalled();
  });
});
