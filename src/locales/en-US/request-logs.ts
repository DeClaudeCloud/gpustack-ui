export default {
  'requestLogs.live': 'Live',
  'requestLogs.live.banner':
    'Live tail on — requests appear here a few seconds after they finish.',
  'requestLogs.live.updatedAt': 'Updated {time}',
  'requestLogs.live.disabledCustom':
    'Live tail follows a relative time range. Pick one of the "Last …" ranges to use it.',

  'requestLogs.filter.search': 'Search ID or model',
  'requestLogs.filter.status': 'Status',
  'requestLogs.filter.model': 'Model',
  'requestLogs.filter.apiKey': 'API key',
  'requestLogs.filter.user': 'User',
  'requestLogs.filter.stream': 'Streaming',
  'requestLogs.filter.stream.yes': 'Streamed',
  'requestLogs.filter.stream.no': 'Not streamed',
  'requestLogs.filter.timeRange': 'Time range',

  'requestLogs.range.15m': 'Last 15 minutes',
  'requestLogs.range.1h': 'Last hour',
  'requestLogs.range.6h': 'Last 6 hours',
  'requestLogs.range.24h': 'Last 24 hours',
  'requestLogs.range.7d': 'Last 7 days',
  'requestLogs.range.30d': 'Last 30 days',
  'requestLogs.range.custom': 'Custom range',

  'requestLogs.stats.totalRequests': 'Total requests',
  'requestLogs.stats.totalRequests.hint':
    'Requests that finished in the selected time range.',
  'requestLogs.stats.successRate': 'Success rate',
  'requestLogs.stats.successRate.hint':
    'Share of requests that succeeded. A request retried on a fallback target counts once per attempt.',
  'requestLogs.stats.userSuccess': 'User success',
  'requestLogs.stats.userSuccess.hint':
    'Share of requests that succeeded as the caller saw them: a request retried on a fallback target counts once, as a success if any attempt succeeded.',
  'requestLogs.stats.avgLatency': 'Avg latency',
  'requestLogs.stats.avgLatency.hint':
    'Mean time from the request arriving to its response finishing.',
  'requestLogs.stats.p95': 'p95 {value}',
  'requestLogs.stats.speed': 'Output speed',
  'requestLogs.stats.speed.hint':
    'Mean output tokens per second after the first token. TTFT is the mean time to first token of streamed requests.',
  'requestLogs.stats.ttft': 'TTFT {value}',
  'requestLogs.stats.totalTokens': 'Total tokens',
  'requestLogs.stats.totalTokens.hint':
    'Input plus output tokens. Shown underneath as input / output.',
  'requestLogs.stats.vsPrevious': 'vs previous',

  'requestLogs.chart.title': 'Request volume',
  'requestLogs.chart.bucketSeconds': 'per {count} s',
  'requestLogs.chart.bucketMinutes':
    '{count, plural, one {per minute} other {per # minutes}}',
  'requestLogs.chart.bucketHours':
    '{count, plural, one {per hour} other {per # hours}}',

  'requestLogs.table.time': 'Time',
  'requestLogs.table.type': 'Type',
  'requestLogs.table.status': 'Status',
  'requestLogs.table.requestId': 'Request ID',
  'requestLogs.table.model': 'Model',
  'requestLogs.table.duration': 'Duration',
  'requestLogs.table.ttft': 'TTFT',
  'requestLogs.table.speed': 'Tokens/s',
  'requestLogs.table.tokens': 'Tokens',
  'requestLogs.table.apiKey': 'API key',
  'requestLogs.table.userAgent': 'User agent',
  'requestLogs.table.user': 'User',
  'requestLogs.table.total': '{total} requests',

  'requestLogs.status.success': 'Success',
  'requestLogs.status.error': 'Error',
  'requestLogs.status.incomplete': 'Incomplete',
  'requestLogs.status.error.http': 'The request failed with HTTP {code}.',
  'requestLogs.status.error.noResponse':
    'The upstream returned no model response.',
  'requestLogs.status.incomplete.hint':
    'The response ended before its usage was reported: the client disconnected or the upstream stopped mid-response. Token counts are estimated.',

  'requestLogs.type.chat': 'Chat',
  'requestLogs.type.completion': 'Completion',
  'requestLogs.type.embedding': 'Embedding',
  'requestLogs.type.rerank': 'Rerank',
  'requestLogs.type.image': 'Image',
  'requestLogs.type.tts': 'Text to speech',
  'requestLogs.type.stt': 'Speech to text',
  'requestLogs.type.llm': 'LLM',
  'requestLogs.type.unknown': 'Unknown',
  'requestLogs.type.stream': 'stream',

  'requestLogs.apiKey.none': 'Session',
  'requestLogs.tokens.estimated': 'Estimated: the response ended early.',
  'requestLogs.tokens.estimatedShort': 'estimated',
  'requestLogs.unit.tokensPerSecond': 'tok/s',

  'requestLogs.empty.window': 'No requests in this time range',
  'requestLogs.empty.filtered': 'No requests match these filters',
  'requestLogs.empty.subTitle':
    'Requests appear here a few seconds after they finish. Send one through the API or the Playground.',

  'requestLogs.detail.open': 'Open request details',
  'requestLogs.detail.title': 'Request details',
  'requestLogs.detail.identifiers': 'Identifiers',
  'requestLogs.detail.responseId': 'Response ID',
  'requestLogs.detail.requestId': 'Gateway request ID',
  'requestLogs.detail.statusCode': 'HTTP status',
  'requestLogs.detail.notReported': 'Not reported',
  'requestLogs.detail.timing': 'Timing',
  'requestLogs.detail.startedAt': 'Started',
  'requestLogs.detail.completedAt': 'Finished',
  'requestLogs.detail.speed': 'Output speed',
  'requestLogs.detail.tokens': 'Tokens',
  'requestLogs.detail.promptTokens': 'Input',
  'requestLogs.detail.cachedTokens': 'Cached input',
  'requestLogs.detail.completionTokens': 'Output',
  'requestLogs.detail.totalTokens': 'Total',
  'requestLogs.detail.routing': 'Routing',
  'requestLogs.detail.route': 'Requested model',
  'requestLogs.detail.model': 'Served by',
  'requestLogs.detail.provider': 'Provider',
  'requestLogs.detail.cluster': 'Cluster',
  'requestLogs.detail.caller': 'Caller',
  'requestLogs.detail.accessKey': 'Access key'
};
