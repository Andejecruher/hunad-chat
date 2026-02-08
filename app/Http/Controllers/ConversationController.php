<?php

namespace App\Http\Controllers;

use App\Http\Requests\Conversation\StoreConversationRequest;
use App\Models\Channel;
use App\Models\Conversation;
use App\Models\Customer;
use App\Models\Message;
use App\Services\Conversations\ConversationPageService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ConversationController extends Controller
{
    public function __construct(private ConversationPageService $pageService) {}

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        if (! $user || ! $user->company_id) {
            abort(403, 'Unauthorized.');
        }

        return Inertia::render('conversations/index', $this->pageService->buildPageProps(
            $user,
            $request
        ));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): void
    {
        abort(404);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreConversationRequest $request): RedirectResponse
    {
        $user = $request->user();

        if (! $user || ! $user->company_id) {
            abort(403, 'Unauthorized.');
        }

        $conversation = DB::transaction(function () use ($request, $user) {
            $channel = Channel::query()
                ->where('company_id', $user->company_id)
                ->findOrFail($request->integer('channel_id'));

            $customer = Customer::query()->firstOrCreate(
                [
                    'company_id' => $user->company_id,
                    'phone' => $request->input('client_phone'),
                ],
                [
                    'name' => (string) $request->input('client_phone'),
                ]
            );

            $conversation = Conversation::create([
                'channel_id' => $channel->id,
                'customer_id' => $customer->id,
                'assigned_agent_id' => null,
                'status' => 'open',
            ]);

            if ($request->filled('message')) {
                Message::create([
                    'conversation_id' => $conversation->id,
                    'sender_type' => 'agent',
                    'type' => 'text',
                    'content' => (string) $request->input('message'),
                    'attachments' => [],
                    'payload' => null,
                    'is_read' => false,
                ]);
            }

            return $conversation;
        });

        return redirect()->route('conversations.show', $conversation)->with('success', 'Conversacion creada.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, Conversation $conversation): Response
    {
        $this->ensureCompanyAccess($request, $conversation);

        return Inertia::render('conversations/index', $this->pageService->buildPageProps(
            $request->user(),
            $request,
            $conversation
        ));
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id): void
    {
        abort(404);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id): void
    {
        abort(404);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id): void
    {
        abort(404);
    }

    private function ensureCompanyAccess(Request $request, Conversation $conversation): void
    {
        $user = $request->user();

        $conversation->loadMissing('channel');

        if (! $user || ! $conversation->channel || $conversation->channel->company_id !== $user->company_id) {
            abort(403, 'Unauthorized.');
        }
    }
}
