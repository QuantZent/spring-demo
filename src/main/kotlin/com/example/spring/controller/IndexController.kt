package com.example.spring.controller

import org.springframework.stereotype.Controller
import org.springframework.ui.Model
import org.springframework.web.bind.annotation.GetMapping

@Controller // Use @Controller, NOT @RestController
class IndexController {

    @GetMapping("/") // Maps HTTP GET requests to the root path "/"
    fun indexPage(model: Model): String {
        // Add data to the Model. The Model is an object that holds
        // data to be passed to the view (the HTML template).
        model.addAttribute("message", "Hello from the Kotlin Spring Boot Controller!")

        // Return the name of the template file (without the .html extension).
        // Spring Boot will automatically look for index.html in the /templates directory.
        return "index"
    }
}
