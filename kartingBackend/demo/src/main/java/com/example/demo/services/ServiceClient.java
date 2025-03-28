package com.example.demo.services;

import com.example.demo.entities.EntityClient;
import com.example.demo.repositories.RepoClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ServiceClient {
    @Autowired
    private RepoClient repoClient;

    /**
     * Método para crear un nuevo cliente
     */
    public void saveClient(EntityClient client) {
        String clientRUT = client.getClientRUT();
        String clientName = client.getClientName();
        String clientEmail = client.getClientEmail();
        String clientBirthday = client.getClientBirthday();

        if (clientRUT == null || "".equals(clientRUT) ||
                clientName == null || "".equals(clientName) ||
                clientEmail == null || "".equals(clientEmail) ||
                clientBirthday == null || "".equals(clientBirthday)) {
            System.out.println("Debe ingresar todos los datos del cliente");
        } else {
            EntityClient newClient = new EntityClient();
            newClient.setClientRUT(clientRUT);
            newClient.setClientName(clientName);
            newClient.setClientEmail(clientEmail);
            newClient.setClientBirthday(clientBirthday);
            repoClient.save(newClient);
        }
    }
}
