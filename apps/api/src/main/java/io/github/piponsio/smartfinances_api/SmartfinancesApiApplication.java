package io.github.piponsio.smartfinances_api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
@EnableJpaRepositories(basePackages = "io.github.piponsio.smartfinances_api.repository")
public class SmartfinancesApiApplication {

	public static void main(String[] args) {
		SpringApplication.run(SmartfinancesApiApplication.class, args);
	}

}
