---
description: Best practices and guidelines for developing with Python and FastAPI
applyTo: **/*.py
---

# Python and FastAPI Development Guidelines

## Project Structure

- **Organize your project logically:** A common structure includes a main application directory, a directory for routers, a directory for schemas (Pydantic models), and a directory for services or business logic.
- **Use a `main.py` file as the entry point:** This file should create the FastAPI app instance and include the routers.

## Dependency Management

- **Use a virtual environment:** Always use a virtual environment (e.g., `venv` or `conda`) to manage project dependencies.
- **Use a `requirements.txt` file:** List all project dependencies in a `requirements.txt` file.

## Coding Standards

- **Follow PEP 8:** Adhere to the PEP 8 style guide for Python code.
- **Use Pydantic for data validation:** Define request and response models using Pydantic to ensure data validation and generate OpenAPI documentation.
- **Use dependency injection:** Use FastAPI's dependency injection system to manage dependencies and improve testability.
- **Use `async/await` for I/O-bound operations:** Use `async` and `await` for database queries, API calls, and other I/O-bound operations to improve performance.
- **Separate business logic from API endpoints:** Keep your API endpoints clean and focused on handling HTTP requests and responses. Move business logic to separate service functions or classes.
