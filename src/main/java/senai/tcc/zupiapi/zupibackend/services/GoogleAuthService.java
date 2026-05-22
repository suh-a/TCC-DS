package senai.tcc.zupiapi.zupibackend.services;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.client.util.Value;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
public class GoogleAuthService {

    @Value("${google.client.id}")
    private String googleClientId;

    public GoogleIdToken.Payload verifyToken(String tokenString)
            throws Exception {

        GoogleIdTokenVerifier verifier =
                new GoogleIdTokenVerifier.Builder(
                        new NetHttpTransport(),
                        GsonFactory.getDefaultInstance()
                )
                        .setAudience(Collections.singletonList(googleClientId))
                        .build();

        GoogleIdToken idToken = verifier.verify(tokenString);

        if (idToken != null) {
            return idToken.getPayload();
        }

        return null;
    }
}
