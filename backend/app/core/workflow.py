"""
LangGraph Workflow Definition for Revenue Recovery
"""

from langgraph.graph import StateGraph, END
from app.core.state import RevenuRecoveryState, WorkflowStatus
from app.core.nodes import (
    load_customer_context,
    diagnose,
    verify_confidence,
    create_recovery_action,
    execute_recovery,
    complete_and_audit,
)


# ============================================================================
# EDGE FUNCTIONS (Conditional Routing)
# ============================================================================

def ensure_state(state) -> RevenuRecoveryState:
    if isinstance(state, dict):
        return RevenuRecoveryState(**state)
    return state


def should_revise(state) -> str:
    """
    Determine if we should revise diagnosis or proceed.
    This implements the dashed "revise" path in the architecture.
    """
    st = ensure_state(state)
    if st.should_revise and st.revision_count < st.max_revisions:
        return "diagnose"  # Loop back to diagnosis for refinement
    elif st.passes_confidence_check:
        return "create_recovery_action"
    else:
        # Escalate to manual review
        return "create_recovery_action"  # Will be set to manual review in node


def should_execute(state) -> str:
    """Determine if recovery action should execute"""
    st = ensure_state(state)
    if st.selected_action is None:
        return END
    return "execute_recovery"


# ============================================================================
# BUILD WORKFLOW GRAPH
# ============================================================================

def build_workflow_graph(db=None, services=None):
    """
    Construct the LangGraph workflow for revenue recovery.
    
    Flow:
    1. load_customer_context
    2. diagnose (can loop back here via "revise")
    3. verify_confidence
    4. create_recovery_action
    5. execute_recovery
    6. complete_and_audit
    """
    
    workflow = StateGraph(RevenuRecoveryState)
    
    # ========================================
    # Define Nodes
    # ========================================
    
    # Wrap async nodes with proper context
    async def load_customer_context_node(state):
        st = ensure_state(state)
        if db is not None:
            return await load_customer_context(st, db)
        return st
    
    async def diagnose_node(state):
        return await diagnose(ensure_state(state))
    
    async def verify_confidence_node(state):
        return await verify_confidence(ensure_state(state))
    
    async def create_recovery_action_node(state):
        return await create_recovery_action(ensure_state(state))
    
    async def execute_recovery_node(state):
        st = ensure_state(state)
        if services is not None:
            return await execute_recovery(st, services)
        return st
    
    async def complete_and_audit_node(state):
        st = ensure_state(state)
        if db is not None:
            return await complete_and_audit(st, db)
        return st
    
    # Add nodes to graph
    workflow.add_node("load_customer_context", load_customer_context_node)
    workflow.add_node("diagnose", diagnose_node)
    workflow.add_node("verify_confidence", verify_confidence_node)
    workflow.add_node("create_recovery_action", create_recovery_action_node)
    workflow.add_node("execute_recovery", execute_recovery_node)
    workflow.add_node("complete_and_audit", complete_and_audit_node)
    
    # ========================================
    # Define Edges (Transitions)
    # ========================================
    
    # Entry point
    workflow.set_entry_point("load_customer_context")
    
    # Normal flow
    workflow.add_edge("load_customer_context", "diagnose")
    
    # Conditional edges (with revision loop)
    workflow.add_conditional_edges(
        "verify_confidence",
        should_revise,
        {
            "diagnose": "diagnose",  # Loop back for revision
            "create_recovery_action": "create_recovery_action",
        }
    )
    
    workflow.add_edge("diagnose", "verify_confidence")
    workflow.add_edge("create_recovery_action", "execute_recovery")
    
    # Conditional execute
    workflow.add_conditional_edges(
        "execute_recovery",
        should_execute,
        {
            "execute_recovery": "execute_recovery",
            END: END
        }
    )
    
    # Completion
    workflow.add_edge("execute_recovery", "complete_and_audit")
    workflow.add_edge("complete_and_audit", END)
    
    # Compile the graph
    return workflow.compile()


# ============================================================================
# ALTERNATIVE: SIMPLE SYNCHRONOUS WRAPPER
# ============================================================================

class RevenueRecoveryWorkflow:
    """
    Workflow engine for the revenue recovery system.
    Executes the multi-channel LangGraph recovery pipeline.
    """
    
    def __init__(self, db=None, services=None):
        self.db = db
        self.services = services or {}
        try:
            self.graph = build_workflow_graph(db, services)
        except Exception:
            self.graph = None
    
    async def invoke(self, initial_state: RevenuRecoveryState) -> RevenuRecoveryState:
        """
        Execute the multi-stage recovery pipeline with full audit trail.
        """
        state = initial_state
        
        # Stage 1: Load customer context & history
        if self.db is not None:
            state = await load_customer_context(state, self.db)
            
        # Stage 2: AI Diagnosis & Stopping Rules evaluation
        state = await diagnose(state)
        
        # Stage 3: Verify confidence threshold
        state = await verify_confidence(state)
        
        # Revision loop (if low confidence and revisions remain)
        if state.should_revise and state.revision_count <= state.max_revisions:
            state = await diagnose(state)
            state = await verify_confidence(state)
            
        # Stage 4: Create bounded intervention (voice, retry, SMS, discount)
        state = await create_recovery_action(state)
        
        # Stage 5: Execute recovery against target channel
        if state.selected_action:
            state = await execute_recovery(state, self.services)
            
        # Stage 6: Complete, generate compliance trail, persist to MongoDB
        if self.db is not None:
            state = await complete_and_audit(state, self.db)
            
        return state
    
    def invoke_sync(self, initial_state: RevenuRecoveryState) -> RevenuRecoveryState:
        """Execute workflow synchronously"""
        import asyncio
        return asyncio.run(self.invoke(initial_state))


# ============================================================================
# VISUALIZATION & DEBUGGING
# ============================================================================

def visualize_graph():
    """Generate ASCII/Mermaid visualization of the workflow"""
    graph = build_workflow_graph()
    print(graph.get_graph().draw_ascii())
    # For Mermaid: graph.get_graph().draw_mermaid()


if __name__ == "__main__":
    # Debug: Visualize the workflow
    visualize_graph()
