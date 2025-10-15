package com.example.spring.controller

import org.springframework.http.HttpStatus
import org.springframework.stereotype.Controller
import org.springframework.ui.Model
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.server.ResponseStatusException

@Controller // Use @Controller, NOT @RestController
class AdminController {

    @GetMapping("/admin") // Maps HTTP GET requests to the root path "/"
    fun adminRoot(model: Model): String {
        // Add data to the Model. The Model is an object that holds
        // data to be passed to the view (the HTML template).
        model.addAttribute("message", "Hello from the Kotlin Admin Controller!")

        // Return the name of the template file (without the .html extension).
        // Spring Boot will automatically look for index.html in the /templates directory.
        return "admin"
    }

    @GetMapping("/admin/{*path}")
    fun adminDeep(
        model: Model,
        @PathVariable("path", required = false) path: String?
    ): String {
        // Optional: let real files fall through (or return 404)
        if (path?.contains('.') == true) {
            // Either let static resources serve this (preferred),
            // or block it explicitly:
            throw ResponseStatusException(HttpStatus.NOT_FOUND)
        }
        model.addAttribute("message", "Hello from the Kotlin Admin Controller!")
        return "admin" // same SPA shell
    }
}
