package main

import (
	"fmt"
	"net/http"

	"github.com/labstack/echo/v4"
)

type Response struct {
	Message string `json:"message"`
}

func main() {
	server := echo.New()
	server.GET("/health_check", func(c echo.Context) error {
		fmt.Println("healthcheck ok")
		response := Response{
			Message: "Hello, World!",
		}
		return c.JSON(http.StatusOK, response)
	})

	if err := server.Start(":80"); err != nil {
		fmt.Println("error starting server")
	}
}
