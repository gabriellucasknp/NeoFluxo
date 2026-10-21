package com.neoenergia.cesar.neofluxo.config;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import tools.jackson.core.JsonGenerator;
import tools.jackson.core.JsonParser;
import tools.jackson.databind.DeserializationContext;
import tools.jackson.databind.JacksonModule;
import tools.jackson.databind.SerializationContext;
import tools.jackson.databind.ValueDeserializer;
import tools.jackson.databind.ValueSerializer;
import tools.jackson.databind.module.SimpleModule;

@Configuration
public class JacksonConfig {

    @Bean
    public ObjectMapper objectMapper() {
        return new ObjectMapper();
    }

    /**
     * O Spring Boot 4 lê/escreve o HTTP com Jackson 3, mas os DTOs e entidades
     * usam o JsonNode do Jackson 2 (com.fasterxml). Esta ponte converte um no outro.
     */
    @Bean
    public JacksonModule jackson2JsonNodeBridge(ObjectMapper legacy) {
        SimpleModule module = new SimpleModule("jackson2-jsonnode-bridge");
        module.addSerializer(JsonNode.class, new ValueSerializer<JsonNode>() {
            @Override
            public void serialize(JsonNode value, JsonGenerator gen, SerializationContext ctx) {
                gen.writeRawValue(value.toString());
            }
        });
        module.addDeserializer(JsonNode.class, new ValueDeserializer<JsonNode>() {
            @Override
            public JsonNode deserialize(JsonParser p, DeserializationContext ctx) {
                tools.jackson.databind.JsonNode tree = ctx.readTree(p);
                try {
                    return legacy.readTree(tree.toString());
                } catch (JsonProcessingException e) {
                    throw new IllegalArgumentException("JSON inválido", e);
                }
            }
        });
        return module;
    }
}
