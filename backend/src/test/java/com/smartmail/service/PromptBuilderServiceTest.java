package com.smartmail.service;

import com.smartmail.dto.GenerateReplyRequest;
import com.smartmail.dto.SummarizeRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class PromptBuilderServiceTest {

    private PromptBuilderService promptBuilderService;

    @BeforeEach
    void setUp() {
        promptBuilderService = new PromptBuilderService();
    }

    @Test
    @DisplayName("Should build reply prompt containing tone, length, context, and security boundary")
    void testBuildReplyPrompt() {
        GenerateReplyRequest request = new GenerateReplyRequest();
        request.setOriginalContent("Can we reschedule our project sync to Thursday at 3 PM?");
        request.setSenderName("Alex Johnson");
        request.setRecipientName("Sarah Connor");
        request.setTone("Formal");
        request.setLength("Short");
        request.setAdditionalInstructions("Confirm that Thursday at 3 PM works fine.");

        String prompt = promptBuilderService.buildReplyPrompt(request, 1);

        assertTrue(prompt.contains("Tone: Formal"), "Prompt must contain the selected tone");
        assertTrue(prompt.contains("Length: Short"), "Prompt must contain the selected length");
        assertTrue(prompt.contains("Alex Johnson"), "Prompt must contain the sender name");
        assertTrue(prompt.contains("Sarah Connor"), "Prompt must contain the recipient name");
        assertTrue(prompt.contains("Confirm that Thursday at 3 PM works fine"), "Prompt must contain additional instructions");
        assertTrue(prompt.contains("<<<ORIGINAL_EMAIL>>>"), "Prompt must wrap untrusted email in security delimiter");
        assertTrue(prompt.contains("SECURITY WARNING"), "Prompt must instruct AI to guard against prompt injection");
    }

    @Test
    @DisplayName("Should build summarize prompt enforcing JSON schema and untrusted content boundaries")
    void testBuildSummarizePrompt() {
        SummarizeRequest request = new SummarizeRequest();
        request.setEmailContent("Team, please complete the code review before Friday 5 PM. Any blockers?");
        request.setAdditionalInstructions("Highlight the deadline");

        String prompt = promptBuilderService.buildSummarizePrompt(request);

        assertTrue(prompt.contains("\"summary\":"), "Prompt must include summary JSON field requirement");
        assertTrue(prompt.contains("\"mainPoints\":"), "Prompt must include mainPoints JSON field requirement");
        assertTrue(prompt.contains("\"actionItems\":"), "Prompt must include actionItems JSON field requirement");
        assertTrue(prompt.contains("\"deadlines\":"), "Prompt must include deadlines JSON field requirement");
        assertTrue(prompt.contains("<<<SOURCE_EMAIL>>>"), "Prompt must wrap email in security boundary");
    }
}
